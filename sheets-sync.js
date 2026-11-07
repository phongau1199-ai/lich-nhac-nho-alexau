/**
 * Lịch Việt — đồng bộ Google Sheets
 *
 * File này được nạp SAU app.js và không sửa gì trong app.js:
 *   - đọc dữ liệu ban đầu từ localStorage (app.js làm sẵn)
 *   - tải danh sách sự kiện từ Google Sheets rồi thay `events` và render lại
 *   - bọc hàm saveEvents() để mỗi lần thêm/sửa/xoá đều đẩy lên Sheets
 *   - xuất CSV / JSON, và cài đặt kết nối ngay trong giao diện
 *
 * Nếu chưa cấu hình endpoint, website chạy y như cũ (chỉ localStorage).
 *
 * Lưu ý kỹ thuật: `events` và `I18N` trong app.js được khai báo bằng let/const
 * nên là binding ở global lexical environment, KHÔNG phải thuộc tính của
 * window. Vì vậy phải truy cập trực tiếp bằng tên, không qua window.
 */
(function () {
  "use strict";

  var CONFIG_KEY = "lich-viet.sheets.config.v1";
  var PENDING_KEY = "lich-viet.sheets.pending.v1";
  var LAST_SYNC_KEY = "lich-viet.sheets.last-sync.v1";
  var PUSH_DEBOUNCE_MS = 600;
  var RETRY_MS = 30000;
  var REQUEST_TIMEOUT_MS = 20000;

  var DEFAULTS = {
    endpoint: "",
    token: "",
    autoSync: true,
    pollSeconds: 120,
  };

  var state = {
    endpoint: "",
    token: "",
    autoSync: true,
    pollSeconds: 120,
    status: "unconfigured",
    message: "",
    lastSync: 0,
    pending: false,
    busy: false,
    spreadsheetUrl: "",
    lastCount: 0,
  };

  var pushTimer = null;
  var pollTimer = null;
  var retryTimer = null;
  var jsonpSeq = 0;
  var dom = {};

  /* ---------------------------------------------------------------- */
  /* Tiện ích                                                          */
  /* ---------------------------------------------------------------- */

  function t(key, values) {
    if (typeof window.t === "function") return window.t(key, values || {});
    return key;
  }

  function toast(message, isError) {
    if (typeof window.showToast === "function") {
      window.showToast(message, !!isError);
    } else if (window.console) {
      console[isError ? "error" : "log"]("[sheets]", message);
    }
  }

  function rerender() {
    if (typeof window.render === "function") window.render();
  }

  /** Đọc `events` của app.js (global lexical binding). */
  function readLocalEvents() {
    try {
      return Array.isArray(events) ? events.slice() : [];
    } catch (error) {
      return [];
    }
  }

  /** Ghi đè `events` của app.js. */
  function writeLocalEvents(next) {
    try {
      events = next;
      return true;
    } catch (error) {
      return false;
    }
  }

  function readStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  }

  function removeStorage(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      /* bỏ qua */
    }
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function stampNow() {
    var now = new Date();
    return now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
  }

  function formatTime(milliseconds) {
    if (!milliseconds) return "";
    var date = new Date(milliseconds);
    return (
      pad(date.getDate()) +
      "/" +
      pad(date.getMonth() + 1) +
      " " +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes())
    );
  }

  function download(filename, content, mime) {
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.rel = "noopener";
    document.body.append(link);
    link.click();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
      link.remove();
    }, 0);
  }

  /* ---------------------------------------------------------------- */
  /* Cấu hình                                                          */
  /* ---------------------------------------------------------------- */

  function loadConfig() {
    var base = Object.assign({}, DEFAULTS, window.LICH_VIET_SHEETS || {});
    var stored = null;
    try {
      stored = JSON.parse(readStorage(CONFIG_KEY) || "null");
    } catch (error) {
      stored = null;
    }
    var config = Object.assign({}, base, stored || {});

    state.endpoint = normaliseEndpoint(config.endpoint);
    state.token = String(config.token || "").trim();
    state.autoSync = config.autoSync !== false;
    state.pollSeconds = Number(config.pollSeconds) >= 0 ? Number(config.pollSeconds) : 120;

    var last = Number(readStorage(LAST_SYNC_KEY) || 0);
    state.lastSync = isFinite(last) ? last : 0;
    state.pending = readStorage(PENDING_KEY) === "1";
  }

  function saveConfig() {
    writeStorage(
      CONFIG_KEY,
      JSON.stringify({
        endpoint: state.endpoint,
        token: state.token,
        autoSync: state.autoSync,
        pollSeconds: state.pollSeconds,
      }),
    );
  }

  function normaliseEndpoint(value) {
    var url = String(value || "").trim();
    if (!url) return "";
    // Người dùng thường dán link /dev hoặc link editor → quy về /exec.
    url = url.replace(/\/dev(\?|$)/, "/exec$1");
    return url.replace(/\/+$/, "");
  }

  function endpointLooksValid(url) {
    if (!/^https:\/\/[^\s]+$/i.test(url)) return false;
    return /\/exec(\?|$)/.test(url);
  }

  function setPending(value) {
    state.pending = !!value;
    if (value) writeStorage(PENDING_KEY, "1");
    else removeStorage(PENDING_KEY);
  }

  /* ---------------------------------------------------------------- */
  /* Gọi Apps Script                                                   */
  /* ---------------------------------------------------------------- */

  function withTimeout(promise, milliseconds) {
    return new Promise(function (resolve, reject) {
      var timer = window.setTimeout(function () {
        reject(new Error(t("sheetsTimeout")));
      }, milliseconds);
      promise.then(
        function (value) {
          window.clearTimeout(timer);
          resolve(value);
        },
        function (error) {
          window.clearTimeout(timer);
          reject(error);
        },
      );
    });
  }

  function parsePayload(text) {
    var parsed;
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      throw new Error(t("sheetsBadResponse") + " " + String(text).slice(0, 120));
    }
    if (!parsed || parsed.ok !== true) {
      throw new Error((parsed && (parsed.message || parsed.error)) || t("sheetsUnknownError"));
    }
    return parsed.data || {};
  }

  /**
   * POST dạng text/plain để trình duyệt coi là "simple request" → không gửi
   * preflight OPTIONS (Apps Script không trả lời OPTIONS).
   */
  function postAction(action, payload) {
    var body = Object.assign({ action: action, token: state.token }, payload || {});

    return withTimeout(
      fetch(state.endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(body),
        redirect: "follow",
        cache: "no-store",
      }).then(function (response) {
        return response.text().then(parsePayload);
      }),
      REQUEST_TIMEOUT_MS,
    );
  }

  /** JSONP: chỉ dùng để ĐỌC khi fetch bị CORS chặn. */
  function getJsonp(action, payload) {
    return withTimeout(
      new Promise(function (resolve, reject) {
        var callbackName = "__lvSheets" + ++jsonpSeq + "_" + Date.now();
        var script = document.createElement("script");

        function cleanup() {
          try {
            delete window[callbackName];
          } catch (error) {
            window[callbackName] = undefined;
          }
          script.remove();
        }

        window[callbackName] = function (response) {
          cleanup();
          if (response && response.ok === true) resolve(response.data || {});
          else {
            reject(
              new Error(
                (response && (response.message || response.error)) || t("sheetsUnknownError"),
              ),
            );
          }
        };

        var query = Object.assign({ action: action, token: state.token }, payload || {});
        var parts = Object.keys(query).map(function (key) {
          return encodeURIComponent(key) + "=" + encodeURIComponent(query[key]);
        });

        script.src =
          state.endpoint +
          (state.endpoint.indexOf("?") >= 0 ? "&" : "?") +
          parts.join("&") +
          "&callback=" +
          callbackName +
          "&_=" +
          Date.now();
        script.async = true;
        script.onerror = function () {
          cleanup();
          reject(new Error(t("sheetsNetworkError")));
        };
        document.head.append(script);
      }),
      REQUEST_TIMEOUT_MS + 1000,
    );
  }

  function isTransportError(error) {
    if (!error) return false;
    var message = String(error.message || "");
    return error instanceof TypeError || /failed to fetch|networkerror|load failed/i.test(message);
  }

  /** Đọc dữ liệu: thử POST, nếu lỗi mạng/CORS thì lùi về JSONP. */
  function readRemote(action, payload) {
    return postAction(action, payload).catch(function (error) {
      if (!isTransportError(error)) throw error;
      return getJsonp(action, payload);
    });
  }

  /* ---------------------------------------------------------------- */
  /* Chuẩn hoá & trộn dữ liệu                                          */
  /* ---------------------------------------------------------------- */

  var CATEGORIES = ["work", "family", "personal", "celebration"];
  var REMINDERS = ["0", "15", "60", "1440", "none"];
  var REPEATS = ["none", "solar", "lunar"];

  function normaliseEvent(raw) {
    raw = raw || {};
    var category = CATEGORIES.indexOf(String(raw.category)) >= 0 ? String(raw.category) : "work";
    var reminder = REMINDERS.indexOf(String(raw.reminder)) >= 0 ? String(raw.reminder) : "60";
    var repeat = REPEATS.indexOf(String(raw.repeat)) >= 0 ? String(raw.repeat) : "none";
    var date = String(raw.date || "").slice(0, 10);
    var endDate = String(raw.endDate || raw.date || "").slice(0, 10);

    // Ngày kết thúc không được trước ngày bắt đầu.
    if (!endDate || (date && endDate < date)) endDate = date;

    return {
      id: String(raw.id || "").slice(0, 64),
      title: String(raw.title || "").trim().slice(0, 80),
      date: date,
      endDate: endDate,
      time: String(raw.time || "").slice(0, 5),
      category: category,
      emoji: String(raw.emoji || "📌").slice(0, 8),
      note: String(raw.note || "").slice(0, 240),
      reminder: reminder,
      repeat: repeat,
      createdAt: Number(raw.createdAt) || Date.now(),
      updatedAt: Number(raw.updatedAt) || Date.now(),
    };
  }

  function sortEvents(list) {
    return list.slice().sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      var at = a.time || "23:59";
      var bt = b.time || "23:59";
      if (at !== bt) return at < bt ? -1 : 1;
      return String(a.title).localeCompare(String(b.title));
    });
  }

  /** Gộp theo id, giữ bản có updatedAt lớn hơn. */
  function mergeEvents(remote, local) {
    var map = new Map();
    (remote || []).forEach(function (item) {
      var event = normaliseEvent(item);
      if (event.id) map.set(event.id, event);
    });
    (local || []).forEach(function (item) {
      var event = normaliseEvent(item);
      if (!event.id) return;
      var existing = map.get(event.id);
      if (!existing || event.updatedAt >= existing.updatedAt) map.set(event.id, event);
    });
    return sortEvents(Array.from(map.values()));
  }

  /* ---------------------------------------------------------------- */
  /* Trạng thái                                                        */
  /* ---------------------------------------------------------------- */

  function cacheDom() {
    dom.button = document.getElementById("sheets-open");
    dom.buttonLabel = document.getElementById("sheets-button-label");
    dom.dialog = document.getElementById("sheets-modal");
    dom.dialogDot = document.getElementById("sheets-dialog-dot");
    dom.statusText = document.getElementById("sheets-status-text");
    dom.statusMeta = document.getElementById("sheets-status-meta");
    dom.endpoint = document.getElementById("sheets-endpoint");
    dom.token = document.getElementById("sheets-token");
    dom.save = document.getElementById("sheets-save");
    dom.sync = document.getElementById("sheets-sync");
    dom.exportCsv = document.getElementById("sheets-export-csv");
    dom.exportJson = document.getElementById("sheets-export-json");
    dom.openSheet = document.getElementById("sheets-open-sheet");
    dom.disconnect = document.getElementById("sheets-disconnect");
    dom.close = document.getElementById("sheets-close-btn");
    dom.cancel = document.getElementById("sheets-cancel-btn");
    dom.footerStatus = document.getElementById("sheets-footer-status");
  }

  function statusLabel(status) {
    if (status === "ok") return t("sheetsStatusOk");
    if (status === "syncing") return t("sheetsStatusSyncing");
    if (status === "error") return t("sheetsStatusError");
    if (status === "offline") return t("sheetsStatusOffline");
    return t("sheetsStatusUnconfigured");
  }

  function toneOf(status) {
    if (status === "ok") return "ok";
    if (status === "syncing") return "syncing";
    if (status === "unconfigured") return "off";
    return "error";
  }

  function setStatus(status, message) {
    state.status = status;
    state.message = message || "";
    renderStatus();
    updateRetryTimer();
  }

  function renderStatus() {
    var label = statusLabel(state.status);
    var tone = toneOf(state.status);

    if (dom.button) {
      dom.button.dataset.state = tone;
      dom.button.setAttribute("aria-label", t("sheetsButtonAria", { status: label }));
      dom.button.title = t("sheetsButtonAria", { status: label });
    }
    if (dom.buttonLabel) dom.buttonLabel.textContent = t("sheetsButton");

    if (dom.dialogDot) dom.dialogDot.dataset.state = tone;
    if (dom.statusText) dom.statusText.textContent = label;

    if (dom.statusMeta) {
      if (state.status === "error" && state.message) {
        dom.statusMeta.textContent = state.message;
      } else if (state.lastSync) {
        dom.statusMeta.textContent = t("sheetsLastSync", { time: formatTime(state.lastSync) });
      } else if (state.endpoint) {
        dom.statusMeta.textContent = t("sheetsNeverSynced");
      } else {
        dom.statusMeta.textContent = t("sheetsLocalOnly");
      }
    }

    if (dom.footerStatus) {
      if (!state.endpoint) {
        dom.footerStatus.hidden = true;
        dom.footerStatus.textContent = "";
      } else {
        dom.footerStatus.hidden = false;
        dom.footerStatus.textContent =
          (state.pending ? t("sheetsFooterPending") : t("sheetsFooterSynced")) +
          " · " +
          t("sheetsFooterCount", { count: state.lastCount || readLocalEvents().length });
      }
    }

    if (dom.openSheet) {
      if (state.spreadsheetUrl) {
        dom.openSheet.href = state.spreadsheetUrl;
        dom.openSheet.hidden = false;
      } else {
        dom.openSheet.hidden = true;
      }
    }

    if (dom.endpoint && document.activeElement !== dom.endpoint) dom.endpoint.value = state.endpoint;
    if (dom.token && document.activeElement !== dom.token) dom.token.value = state.token;

    var busy = state.busy || state.status === "syncing";
    [dom.save, dom.sync, dom.exportCsv].forEach(function (element) {
      if (element) element.disabled = busy;
    });
    if (dom.disconnect) dom.disconnect.hidden = !state.endpoint;
  }

  function updateRetryTimer() {
    var needsRetry = state.pending || state.status === "error";
    if (needsRetry && state.endpoint && !retryTimer) {
      retryTimer = window.setInterval(function () {
        if (state.busy || !state.endpoint) return;
        if (state.pending) push();
        else pull({ silent: true });
      }, RETRY_MS);
    } else if (!needsRetry && retryTimer) {
      window.clearInterval(retryTimer);
      retryTimer = null;
    }
  }

  /* ---------------------------------------------------------------- */
  /* Đồng bộ                                                           */
  /* ---------------------------------------------------------------- */

  function applyEvents(list) {
    writeLocalEvents(list);
    state.lastCount = list.length;
    rerender();
  }

  function finishSync(count) {
    state.busy = false;
    state.lastSync = Date.now();
    state.lastCount = typeof count === "number" ? count : readLocalEvents().length;
    setPending(false);
    writeStorage(LAST_SYNC_KEY, String(state.lastSync));
    setStatus("ok");
    renderStatus();
  }

  function failSync(error) {
    state.busy = false;
    setStatus("error", (error && error.message) || t("sheetsUnknownError"));
    return state.message;
  }

  function pull(options) {
    options = options || {};
    if (!state.endpoint || state.busy) return Promise.resolve(false);
    state.busy = true;
    setStatus("syncing");

    return readRemote("list")
      .then(function (data) {
        var remote = Array.isArray(data.events) ? data.events : [];
        var merged = mergeEvents(remote, readLocalEvents());
        applyEvents(merged);
        finishSync(merged.length);
        if (!options.silent) toast(t("sheetsToastPulled", { count: merged.length }));
        return true;
      })
      .catch(function (error) {
        var message = failSync(error);
        if (!options.silent) toast(t("sheetsToastFailed", { message: message }), true);
        return false;
      });
  }

  function push() {
    if (!state.endpoint) return Promise.resolve(false);
    if (state.busy) {
      schedulePush();
      return Promise.resolve(false);
    }
    state.busy = true;
    setStatus("syncing");

    var snapshot = readLocalEvents().map(normaliseEvent);

    return postAction("save", { events: snapshot })
      .then(function (data) {
        finishSync(typeof data.count === "number" ? data.count : snapshot.length);
        return true;
      })
      .catch(function (error) {
        state.busy = false;
        if (isTransportError(error)) {
          // Request có thể đã tới Google; đánh dấu chờ và hoà giải ở lần sau.
          setPending(true);
          setStatus("offline", (error && error.message) || "");
          toast(t("sheetsToastOfflineSaved"), true);
        } else {
          failSync(error);
          toast(t("sheetsToastFailed", { message: (error && error.message) || "" }), true);
        }
        return false;
      });
  }

  function schedulePush() {
    if (!state.endpoint) return;
    if (pushTimer) window.clearTimeout(pushTimer);
    pushTimer = window.setTimeout(function () {
      pushTimer = null;
      push();
    }, PUSH_DEBOUNCE_MS);
  }

  function ping() {
    if (!state.endpoint) return Promise.resolve(false);
    state.busy = true;
    setStatus("syncing");
    return readRemote("ping")
      .then(function (data) {
        state.busy = false;
        state.spreadsheetUrl = data.url || "";
        setStatus("ok");
        renderStatus();
        toast(t("sheetsToastConnected"));
        return true;
      })
      .catch(function (error) {
        var message = failSync(error);
        toast(t("sheetsToastFailed", { message: message }), true);
        return false;
      });
  }

  /* ---------------------------------------------------------------- */
  /* Móc vào saveEvents() của app.js                                   */
  /* ---------------------------------------------------------------- */

  function installSaveHook() {
    if (typeof window.saveEvents !== "function") return false;
    if (window.saveEvents.__lvSheets) return true;

    var original = window.saveEvents;
    var hooked = function () {
      var result = original.apply(this, arguments);
      schedulePush();
      return result;
    };
    hooked.__lvSheets = true;
    window.saveEvents = hooked;
    return true;
  }

  /* ---------------------------------------------------------------- */
  /* Xuất dữ liệu                                                      */
  /* ---------------------------------------------------------------- */

  var CATEGORY_LABEL = {
    work: "Công việc",
    family: "Gia đình",
    personal: "Cá nhân",
    celebration: "Kỷ niệm",
  };

  var REMINDER_LABEL = {
    "0": "Đúng giờ",
    "15": "15 phút",
    "60": "1 giờ",
    "1440": "1 ngày",
    none: "Không nhắc",
  };

  var REPEAT_LABEL = {
    none: "Không lặp",
    solar: "Hằng năm (dương lịch)",
    lunar: "Hằng năm (âm lịch)",
  };

  function csvCell(value) {
    var text = String(value === null || value === undefined ? "" : value);
    return /[",\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  }

  function exportCsv() {
    var list = sortEvents(readLocalEvents().map(normaliseEvent));
    if (!list.length) {
      toast(t("sheetsToastEmpty"), true);
      return;
    }

    var header = [
      "id",
      "Tên sự kiện",
      "Ngày",
      "Đến ngày",
      "Giờ",
      "Nhóm",
      "Biểu tượng",
      "Ghi chú",
      "Nhắc trước",
      "Lặp lại",
      "Tạo lúc",
      "Cập nhật lúc",
    ];

    var lines = [header.map(csvCell).join(",")];
    list.forEach(function (event) {
      lines.push(
        [
          event.id,
          event.title,
          event.date,
          event.endDate,
          event.time,
          CATEGORY_LABEL[event.category] || event.category,
          event.emoji,
          event.note,
          REMINDER_LABEL[event.reminder] || event.reminder,
          REPEAT_LABEL[event.repeat] || event.repeat,
          event.createdAt ? new Date(event.createdAt).toISOString() : "",
          event.updatedAt ? new Date(event.updatedAt).toISOString() : "",
        ]
          .map(csvCell)
          .join(","),
      );
    });

    // BOM để Excel hiển thị đúng tiếng Việt.
    download(
      "lich-viet-su-kien-" + stampNow() + ".csv",
      "\ufeff" + lines.join("\r\n"),
      "text/csv;charset=utf-8",
    );
    toast(t("sheetsToastExported", { count: list.length }));
  }

  function exportJson() {
    var list = sortEvents(readLocalEvents().map(normaliseEvent));
    if (!list.length) {
      toast(t("sheetsToastEmpty"), true);
      return;
    }
    download(
      "lich-viet-su-kien-" + stampNow() + ".json",
      JSON.stringify({ exportedAt: new Date().toISOString(), events: list }, null, 2),
      "application/json;charset=utf-8",
    );
    toast(t("sheetsToastExported", { count: list.length }));
  }

  /* ---------------------------------------------------------------- */
  /* i18n (bổ sung vào từ điển của app.js)                             */
  /* ---------------------------------------------------------------- */

  function addTranslations() {
    if (typeof I18N !== "object" || !I18N) return;

    var vi = {
      sheetsButton: "Sheets",
      sheetsButtonAria: "Google Sheets: {status}. Mở cài đặt kết nối.",
      sheetsKicker: "DỮ LIỆU",
      sheetsDialogTitle: "Kết nối Google Sheets",
      sheetsStatusOk: "Đã kết nối",
      sheetsStatusSyncing: "Đang đồng bộ…",
      sheetsStatusError: "Lỗi đồng bộ",
      sheetsStatusOffline: "Ngoại tuyến",
      sheetsStatusUnconfigured: "Chưa kết nối",
      sheetsLocalOnly: "Dữ liệu đang lưu trên trình duyệt này.",
      sheetsNeverSynced: "Chưa đồng bộ lần nào.",
      sheetsLastSync: "Đồng bộ lần cuối: {time}",
      sheetsEndpointLabel: "URL Web App (/exec)",
      sheetsTokenLabel: "API token",
      sheetsTokenHelp: "Chuỗi API_TOKEN in ra trong Execution log khi bạn chạy hàm setup().",
      sheetsSaveConfig: "Lưu & kiểm tra",
      sheetsSyncNow: "Đồng bộ ngay",
      sheetsExportKicker: "XUẤT DỮ LIỆU",
      sheetsExportCsv: "Xuất CSV",
      sheetsExportJson: "Xuất JSON",
      sheetsOpenSheet: "Mở Google Sheet",
      sheetsDisconnect: "Ngắt kết nối",
      sheetsHelpTitle: "Cài đặt trong 4 bước",
      sheetsHelpStep1: "Tạo Google Sheet mới → Tiện ích mở rộng → Apps Script.",
      sheetsHelpStep2: "Dán nội dung file Code.gs, chạy hàm setup() rồi lấy API_TOKEN trong log.",
      sheetsHelpStep3:
        "Deploy → New deployment → Web app: Execute as “Me”, Who has access “Anyone”; copy URL kết thúc bằng /exec.",
      sheetsHelpStep4: "Dán URL và token vào đây, bấm “Lưu & kiểm tra”.",
      sheetsToastConnected: "Đã kết nối Google Sheets.",
      sheetsToastPulled: "Đã tải {count} sự kiện từ Google Sheets.",
      sheetsToastExported: "Đã xuất {count} sự kiện.",
      sheetsToastOfflineSaved: "Chưa gửi được lên Sheets — đã lưu trên máy, sẽ thử lại.",
      sheetsToastFailed: "Lỗi Google Sheets: {message}",
      sheetsToastEmpty: "Chưa có sự kiện nào để xuất.",
      sheetsToastConfigSaved: "Đã lưu cấu hình kết nối.",
      sheetsToastConfigInvalid: "URL phải là https://… và kết thúc bằng /exec.",
      sheetsToastDisconnected: "Đã ngắt kết nối Google Sheets.",
      sheetsConfirmDisconnect: "Ngắt kết nối Google Sheets? Dữ liệu vẫn còn trên Sheet và trên máy.",
      sheetsBadResponse: "Phản hồi không phải JSON.",
      sheetsNetworkError: "Không gọi được Google Sheets.",
      sheetsTimeout: "Google Sheets phản hồi quá lâu.",
      sheetsUnknownError: "Lỗi không xác định.",
      sheetsFooterSynced: "Đã đồng bộ Google Sheets",
      sheetsFooterPending: "Chờ đồng bộ Google Sheets",
      sheetsFooterCount: "{count} sự kiện",
    };

    var zh = {
      sheetsButton: "表格",
      sheetsButtonAria: "Google Sheets：{status}。打开连接设置。",
      sheetsKicker: "数据",
      sheetsDialogTitle: "连接 Google Sheets",
      sheetsStatusOk: "已连接",
      sheetsStatusSyncing: "正在同步…",
      sheetsStatusError: "同步失败",
      sheetsStatusOffline: "离线",
      sheetsStatusUnconfigured: "未连接",
      sheetsLocalOnly: "数据目前仅保存在此浏览器。",
      sheetsNeverSynced: "尚未同步。",
      sheetsLastSync: "上次同步：{time}",
      sheetsEndpointLabel: "Web App 网址（/exec）",
      sheetsTokenLabel: "API 令牌",
      sheetsTokenHelp: "运行 setup() 后，在“执行记录”中显示的 API_TOKEN。",
      sheetsSaveConfig: "保存并检查",
      sheetsSyncNow: "立即同步",
      sheetsExportKicker: "导出数据",
      sheetsExportCsv: "导出 CSV",
      sheetsExportJson: "导出 JSON",
      sheetsOpenSheet: "打开 Google 表格",
      sheetsDisconnect: "断开连接",
      sheetsHelpTitle: "四步完成配置",
      sheetsHelpStep1: "新建 Google 表格 → 扩展程序 → Apps Script。",
      sheetsHelpStep2: "粘贴 Code.gs 内容，运行 setup()，从日志取得 API_TOKEN。",
      sheetsHelpStep3:
        "部署 → 新部署 → 网页应用：执行身份“我”，访问权限“任何人”；复制以 /exec 结尾的网址。",
      sheetsHelpStep4: "在此填入网址与令牌，点击“保存并检查”。",
      sheetsToastConnected: "已连接 Google Sheets。",
      sheetsToastPulled: "已从 Google Sheets 载入 {count} 条日程。",
      sheetsToastExported: "已导出 {count} 条日程。",
      sheetsToastOfflineSaved: "未能上传到表格——已保存在本机，稍后重试。",
      sheetsToastFailed: "Google Sheets 错误：{message}",
      sheetsToastEmpty: "没有可导出的日程。",
      sheetsToastConfigSaved: "已保存连接配置。",
      sheetsToastConfigInvalid: "网址必须是 https://… 并以 /exec 结尾。",
      sheetsToastDisconnected: "已断开 Google Sheets。",
      sheetsConfirmDisconnect: "断开 Google Sheets？表格与本机数据都会保留。",
      sheetsBadResponse: "返回内容不是 JSON。",
      sheetsNetworkError: "无法访问 Google Sheets。",
      sheetsTimeout: "Google Sheets 响应超时。",
      sheetsUnknownError: "未知错误。",
      sheetsFooterSynced: "已同步 Google Sheets",
      sheetsFooterPending: "等待同步 Google Sheets",
      sheetsFooterCount: "{count} 条日程",
    };

    Object.assign(I18N.vi, vi);
    Object.assign(I18N.zh, zh);
  }

  /* ---------------------------------------------------------------- */
  /* Giao diện                                                         */
  /* ---------------------------------------------------------------- */

  function openDialog() {
    if (!dom.dialog) return;
    if (dom.endpoint) dom.endpoint.value = state.endpoint;
    if (dom.token) dom.token.value = state.token;
    renderStatus();
    if (typeof dom.dialog.showModal === "function") dom.dialog.showModal();
  }

  function closeDialog() {
    if (dom.dialog && dom.dialog.open) dom.dialog.close();
  }

  function saveAndCheck() {
    var endpoint = normaliseEndpoint(dom.endpoint ? dom.endpoint.value : "");
    var token = dom.token ? dom.token.value.trim() : "";

    if (!endpoint) {
      disconnect(false);
      return;
    }
    if (!endpointLooksValid(endpoint)) {
      toast(t("sheetsToastConfigInvalid"), true);
      return;
    }

    state.endpoint = endpoint;
    state.token = token;
    saveConfig();
    toast(t("sheetsToastConfigSaved"));
    ping().then(function (ok) {
      if (!ok) return;
      startPolling();
      pull({ silent: true });
    });
  }

  function disconnect(ask) {
    if (ask && state.endpoint) {
      if (!window.confirm(t("sheetsConfirmDisconnect"))) return;
    }
    state.endpoint = "";
    state.token = "";
    state.spreadsheetUrl = "";
    state.lastSync = 0;
    saveConfig();
    removeStorage(LAST_SYNC_KEY);
    setPending(false);
    stopPolling();
    setStatus("unconfigured");
    toast(t("sheetsToastDisconnected"));
  }

  function wireUi() {
    if (dom.button) dom.button.addEventListener("click", openDialog);
    if (dom.close) dom.close.addEventListener("click", closeDialog);
    if (dom.cancel) dom.cancel.addEventListener("click", closeDialog);
    if (dom.save) dom.save.addEventListener("click", saveAndCheck);

    if (dom.sync) {
      dom.sync.addEventListener("click", function () {
        if (!state.endpoint) {
          toast(t("sheetsToastConfigInvalid"), true);
          return;
        }
        pull({});
      });
    }

    if (dom.exportCsv) dom.exportCsv.addEventListener("click", exportCsv);
    if (dom.exportJson) dom.exportJson.addEventListener("click", exportJson);

    if (dom.disconnect) {
      dom.disconnect.addEventListener("click", function () {
        disconnect(true);
      });
    }

    if (dom.dialog) {
      dom.dialog.addEventListener("click", function (event) {
        if (event.target === dom.dialog) closeDialog();
      });
      dom.dialog.addEventListener("close", function () {
        if (dom.button) dom.button.focus();
      });
    }
  }

  /* ---------------------------------------------------------------- */
  /* Polling & sự kiện hệ thống                                        */
  /* ---------------------------------------------------------------- */

  function startPolling() {
    stopPolling();
    if (!state.endpoint || !state.autoSync || !state.pollSeconds) return;
    pollTimer = window.setInterval(function () {
      if (document.hidden || state.busy || !state.endpoint) return;
      pull({ silent: true });
    }, state.pollSeconds * 1000);
  }

  function stopPolling() {
    if (pollTimer) {
      window.clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  /* ---------------------------------------------------------------- */
  /* Khởi động                                                         */
  /* ---------------------------------------------------------------- */

  function boot() {
    cacheDom();
    loadConfig();
    addTranslations();

    if (typeof window.applyStaticTranslations === "function") {
      window.applyStaticTranslations();
    }

    installSaveHook();
    wireUi();
    setStatus(state.endpoint ? "syncing" : "unconfigured");

    if (state.endpoint) {
      if (state.pending) {
        push();
      } else {
        ping().then(function (ok) {
          if (ok) pull({ silent: true });
        });
      }
      startPolling();
    }

    window.addEventListener("online", function () {
      if (!state.endpoint) return;
      if (state.pending) push();
      else pull({ silent: true });
    });

    window.addEventListener("offline", function () {
      if (state.endpoint) setStatus("offline", t("sheetsNetworkError"));
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden || !state.endpoint) return;
      if (Date.now() - state.lastSync > 60000 && !state.busy) pull({ silent: true });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
