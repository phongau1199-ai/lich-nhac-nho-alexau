/**
 * Lịch Việt — lớp đăng nhập phía client
 *
 * LƯU Ý BẢO MẬT: đây là "cửa" chứ không phải "khoá". Mật khẩu được lưu dưới
 * dạng hash SHA-256 (không phải chữ trần), nhưng mã nguồn vẫn nằm trên máy
 * người dùng: ai rành kỹ thuật đều có thể đọc hash, sửa localStorage, hoặc mở
 * thẳng index.html mà không qua login. Muốn chặn thật thì phải xác thực ở
 * server (Cloudflare Access, Vercel password, hoặc Google OAuth).
 *
 * Cái lớp này làm được: người dùng thường không vào được lịch khi chưa đăng
 * nhập, và không nhìn thấy mật khẩu trong DevTools.
 */
(function (global) {
  "use strict";

  var SESSION_KEY = "lich-viet.auth.v1";
  var SESSION_DAYS = 7;
  var USERNAME = "admin";
  // Chỉ lưu hash SHA-256 của mật khẩu; không ghi mật khẩu gốc ở bất kỳ đâu.
  var PASSWORD_HASH = "5c253cb76051829841c7938cec583b5ecc82fe4b2439ba0ca3d6b64ab8874ea2";
  var LOGIN_PAGE = "login.html";

  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }

  /** Mã hoá UTF-8 thủ công để hash đúng cả chuỗi có dấu tiếng Việt. */
  function utf8Bytes(text) {
    var out = [];
    for (var i = 0; i < text.length; i += 1) {
      var code = text.charCodeAt(i);

      if (code < 0x80) {
        out.push(code);
      } else if (code < 0x800) {
        out.push(0xc0 | (code >> 6), 0x80 | (code & 63));
      } else if (code >= 0xd800 && code <= 0xdbff && i + 1 < text.length) {
        var next = text.charCodeAt(i + 1);
        var pair = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
        i += 1;
        out.push(
          0xf0 | (pair >> 18),
          0x80 | ((pair >> 12) & 63),
          0x80 | ((pair >> 6) & 63),
          0x80 | (pair & 63),
        );
      } else {
        out.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 63), 0x80 | (code & 63));
      }
    }
    return out;
  }

  /** SHA-256 thuần JS, không cần crypto.subtle nên chạy được cả file:// và http nội bộ. */
  function sha256(message) {
    var text = String(message == null ? "" : message);
    var bytes = utf8Bytes(text);
    var i;

    var bitLength = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);

    // 64-bit length, big-endian (phần cao 32 bit luôn 0 với chuỗi ngắn)
    bytes.push(0, 0, 0, 0);
    bytes.push(
      (bitLength >>> 24) & 255,
      (bitLength >>> 16) & 255,
      (bitLength >>> 8) & 255,
      bitLength & 255,
    );

    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var w = new Array(64);

    for (var offset = 0; offset < bytes.length; offset += 64) {
      for (i = 0; i < 16; i += 1) {
        var base = offset + i * 4;
        w[i] =
          ((bytes[base] << 24) |
            (bytes[base + 1] << 16) |
            (bytes[base + 2] << 8) |
            bytes[base + 3]) >>>
          0;
      }

      for (i = 16; i < 64; i += 1) {
        var s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        var s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }

      var a = H[0];
      var b = H[1];
      var c = H[2];
      var d = H[3];
      var e = H[4];
      var f = H[5];
      var g = H[6];
      var hh = H[7];

      for (i = 0; i < 64; i += 1) {
        var S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
        var ch = (e & f) ^ (~e & g);
        var temp1 = (hh + S1 + ch + K[i] + w[i]) | 0;
        var S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var temp2 = (S0 + maj) | 0;

        hh = g;
        g = f;
        f = e;
        e = (d + temp1) | 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) | 0;
      }

      H[0] = (H[0] + a) | 0;
      H[1] = (H[1] + b) | 0;
      H[2] = (H[2] + c) | 0;
      H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0;
      H[5] = (H[5] + f) | 0;
      H[6] = (H[6] + g) | 0;
      H[7] = (H[7] + hh) | 0;
    }

    return H.map(function (value) {
      return ("00000000" + (value >>> 0).toString(16)).slice(-8);
    }).join("");
  }

  function readSession() {
    try {
      var raw = global.localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || data.user !== USERNAME || typeof data.exp !== "number") return null;
      return data;
    } catch (error) {
      return null;
    }
  }

  function isAuthenticated() {
    var session = readSession();
    return Boolean(session && session.exp > Date.now());
  }

  /** Kiểm tra mật khẩu (dùng chung cho đăng nhập và các thao tác nguy hiểm). */
  function verifyPassword(password) {
    return sha256(String(password || "")) === PASSWORD_HASH;
  }

  /**
   * Đăng nhập. Trả về { ok, code } với code: "user" | "password" | "storage".
   */
  function signIn(user, password) {
    var normalisedUser = String(user || "").trim().toLowerCase();
    if (normalisedUser !== USERNAME) return { ok: false, code: "user" };

    if (!verifyPassword(password)) {
      return { ok: false, code: "password" };
    }

    var session = {
      user: USERNAME,
      issuedAt: Date.now(),
      exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
    };

    try {
      global.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      return { ok: false, code: "storage" };
    }

    return { ok: true };
  }

  function signOut(redirect) {
    try {
      global.localStorage.removeItem(SESSION_KEY);
    } catch (error) {
      /* bỏ qua */
    }
    if (redirect !== false) global.location.replace(LOGIN_PAGE);
  }

  /** Chặn open-redirect: chỉ cho phép file .html cùng thư mục. */
  function safeNext(value) {
    var next = String(value || "").trim();
    if (!next) return "";
    if (!/^[A-Za-z0-9._-]+\.html(\?[A-Za-z0-9._=&%-]*)?$/.test(next)) return "";
    if (next.split("?")[0].toLowerCase() === LOGIN_PAGE) return "";
    return next;
  }

  function currentFileName() {
    var path = String((global.location && global.location.pathname) || "");
    var file = path.substring(path.lastIndexOf("/") + 1);
    return file || "index.html";
  }

  /** Gọi ở đầu mỗi trang cần bảo vệ. Trả về false và chuyển hướng nếu chưa đăng nhập. */
  function requireAuth() {
    if (isAuthenticated()) return true;

    var search = String((global.location && global.location.search) || "");
    var target = LOGIN_PAGE + "?next=" + encodeURIComponent(currentFileName() + search);
    global.location.replace(target);
    return false;
  }

  global.LVAuth = {
    USERNAME: USERNAME,
    SESSION_DAYS: SESSION_DAYS,
    SESSION_KEY: SESSION_KEY,
    sha256: sha256,
    verifyPassword: verifyPassword,
    isAuthenticated: isAuthenticated,
    signIn: signIn,
    signOut: signOut,
    requireAuth: requireAuth,
    safeNext: safeNext,
  };
})(window);
