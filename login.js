/**
 * Lịch Việt — xử lý form đăng nhập
 */
(function () {
  "use strict";

  var form = document.getElementById("login-form");
  var userInput = document.getElementById("login-user");
  var passwordInput = document.getElementById("login-password");
  var errorBox = document.getElementById("login-error");
  var passwordError = document.getElementById("password-error");
  var toggle = document.getElementById("toggle-password");
  var card = document.getElementById("auth-card");

  if (!form || !passwordInput || !window.LVAuth) return;

  var submitButton = form.querySelector('button[type="submit"]');
  var next = "index.html";

  try {
    var params = new URLSearchParams(window.location.search);
    next = LVAuth.safeNext(params.get("next")) || "index.html";
  } catch (error) {
    next = "index.html";
  }

  // Đã đăng nhập rồi thì vào thẳng, không bắt nhập lại.
  if (LVAuth.isAuthenticated()) {
    window.location.replace(next);
    return;
  }

  function clearError() {
    if (errorBox) {
      errorBox.hidden = true;
      errorBox.textContent = "";
    }
    if (passwordError) passwordError.textContent = "";
    passwordInput.removeAttribute("aria-invalid");
    if (card) card.classList.remove("is-shaking");
  }

  function showError(message) {
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.hidden = false;
    }
    passwordInput.setAttribute("aria-invalid", "true");

    if (card) {
      card.classList.remove("is-shaking");
      // Đọc offsetWidth để trình duyệt chạy lại animation.
      void card.offsetWidth;
      card.classList.add("is-shaking");
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearError();

    if (!passwordInput.value) {
      if (passwordError) passwordError.textContent = "Hãy nhập mật khẩu.";
      passwordInput.focus();
      return;
    }

    var result = LVAuth.signIn(userInput ? userInput.value : "", passwordInput.value);

    if (result.ok) {
      if (submitButton) submitButton.disabled = true;
      window.location.replace(next);
      return;
    }

    if (result.code === "storage") {
      showError(
        "Trình duyệt đang chặn lưu phiên đăng nhập. Hãy tắt chế độ riêng tư hoặc cho phép lưu dữ liệu cho trang này.",
      );
    } else {
      showError("Sai mật khẩu. Vui lòng thử lại.");
    }

    passwordInput.select();
  });

  if (toggle) {
    toggle.addEventListener("click", function () {
      var isVisible = passwordInput.type === "text";
      passwordInput.type = isVisible ? "password" : "text";
      toggle.setAttribute("aria-pressed", String(!isVisible));
      toggle.setAttribute("aria-label", isVisible ? "Hiện mật khẩu" : "Ẩn mật khẩu");

      var use = toggle.querySelector("use");
      if (use) use.setAttribute("href", isVisible ? "#icon-eye" : "#icon-eye-off");

      passwordInput.focus();
    });
  }

  passwordInput.addEventListener("input", clearError);
  passwordInput.focus();
})();
