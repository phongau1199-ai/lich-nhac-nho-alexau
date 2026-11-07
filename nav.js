/**
 * Lịch Việt — thanh điều hướng các hạn mục
 *
 * Thanh này là KHUNG cho các phần sẽ làm sau (công việc, ghi chú, báo cáo…).
 * Quy ước:
 *   - Mỗi mục là một <a href="#/<id>" data-nav-item="<id>" data-ready="true|false">
 *   - data-ready="true"  : phần đã có, cho phép chuyển và cập nhật hash
 *   - data-ready="false" : hiện nhãn "Sắp có", bấm vào chỉ báo, KHÔNG điều hướng
 *
 * Màn hẹp (≤ 960px) thanh được thu gọn thành nút ☰ + nhãn khu vực hiện tại;
 * bấm vào mới xổ danh sách. Đóng bằng: chọn một mục, bấm ra ngoài, hoặc Esc.
 *
 * Khi làm phần mới, chỉ cần thêm HTML với data-ready="true" và lắng nghe
 * sự kiện "lv:sectionchange" (detail.id) để hiện nội dung của phần đó.
 */
(function (global) {
  "use strict";

  var doc = global.document;
  var DEFAULT_ID = "lich";
  var items = Array.prototype.slice.call(doc.querySelectorAll("[data-nav-item]"));

  if (!items.length) return;

  var navRoot = doc.getElementById ? doc.getElementById("app-nav") : null;
  var toggle = doc.getElementById ? doc.getElementById("nav-toggle") : null;
  var currentLabel = doc.getElementById ? doc.getElementById("nav-current") : null;

  function labelOf(item) {
    var span = item.querySelector("[data-i18n]");
    var text = span ? span.textContent : item.textContent;
    return String(text || "").trim();
  }

  function find(id) {
    for (var index = 0; index < items.length; index += 1) {
      if (items[index].dataset.navItem === id) return items[index];
    }
    return null;
  }

  function isReady(item) {
    return item.dataset.ready === "true";
  }

  function message(key, values) {
    if (typeof global.t === "function") return global.t(key, values || {});
    return key;
  }

  function notify(text) {
    if (typeof global.showToast === "function") {
      global.showToast(text);
    } else if (global.console) {
      global.console.info(text);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Thu gọn trên màn hẹp                                              */
  /* ---------------------------------------------------------------- */

  function isOpen() {
    return Boolean(navRoot && navRoot.classList.contains("is-open"));
  }

  function setOpen(open) {
    if (!navRoot) return;
    navRoot.classList.toggle("is-open", Boolean(open));
    if (toggle) toggle.setAttribute("aria-expanded", String(Boolean(open)));
  }

  // Trạng thái ban đầu: menu đóng (khớp aria-expanded="false" trong HTML).
  setOpen(false);

  if (toggle) {
    toggle.addEventListener("click", function () {
      setOpen(!isOpen());
    });
  }

  if (doc.addEventListener) {
    doc.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || !isOpen()) return;
      setOpen(false);
      if (toggle && typeof toggle.focus === "function") toggle.focus();
    });

    doc.addEventListener("click", function (event) {
      if (!isOpen()) return;
      if (navRoot && typeof navRoot.contains === "function" && navRoot.contains(event.target)) return;
      setOpen(false);
    });
  }

  /* ---------------------------------------------------------------- */
  /* Điều hướng                                                        */
  /* ---------------------------------------------------------------- */

  function setActive(item) {
    items.forEach(function (element) {
      var active = element === item;
      element.classList.toggle("is-active", active);

      if (active) element.setAttribute("aria-current", "page");
      else element.removeAttribute("aria-current");
    });

    doc.documentElement.dataset.section = item.dataset.navItem;
    if (currentLabel) currentLabel.textContent = labelOf(item);

    global.dispatchEvent(
      new global.CustomEvent("lv:sectionchange", { detail: { id: item.dataset.navItem } }),
    );
  }

  function idFromHash() {
    var match = /^#\/?([\w-]+)$/.exec(global.location.hash || "");
    return match ? match[1] : "";
  }

  function replaceHash(id) {
    if (global.history && typeof global.history.replaceState === "function") {
      global.history.replaceState(null, "", "#/" + id);
    }
  }

  function applyHash() {
    var id = idFromHash();
    var requested = id ? find(id) : null;

    if (requested && isReady(requested)) {
      setActive(requested);
      return;
    }

    // Deep-link tới phần chưa xây dựng → đưa về mục mặc định.
    if (requested && !isReady(requested)) replaceHash(DEFAULT_ID);

    var fallback = find(DEFAULT_ID);
    if (fallback) setActive(fallback);
  }

  items.forEach(function (item) {
    item.addEventListener("click", function (event) {
      if (isReady(item)) {
        setOpen(false);
        return; // để hashchange xử lý
      }

      event.preventDefault();
      notify(message("navSoonToast", { name: labelOf(item) }));
      setOpen(false);
    });
  });

  global.addEventListener("hashchange", applyHash);
  applyHash();

  global.LVNav = {
    defaultId: DEFAULT_ID,
    ids: items.map(function (item) {
      return item.dataset.navItem;
    }),
    setActive: setActive,
    setOpen: setOpen,
    isOpen: isOpen,
    refresh: applyHash,
  };
})(window);
