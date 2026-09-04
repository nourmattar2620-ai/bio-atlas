/**
 * أدوات واجهة مستخدم عامة: Toast / Loading / Modal
 */
const UI = (() => {
  const toastEl = document.getElementById("toast");
  const loadingEl = document.getElementById("loading-overlay");
  const loadingTextEl = document.getElementById("loading-text");

  let toastTimer = null;
  function toast(message, type = "info") {
    toastEl.textContent = message;
    toastEl.classList.remove("error");
    if (type === "error") toastEl.classList.add("error");
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  function showLoading(text = "جارٍ التحميل…") {
    loadingTextEl.textContent = text;
    loadingEl.classList.remove("hidden");
  }
  function hideLoading() {
    loadingEl.classList.add("hidden");
  }

  // ---------- Modal ----------
  const backdrop = document.getElementById("modal-backdrop");
  const titleEl = document.getElementById("modal-title");
  const messageEl = document.getElementById("modal-message");
  const inputEl = document.getElementById("modal-input");
  const cancelBtn = document.getElementById("modal-cancel");
  const confirmBtn = document.getElementById("modal-confirm");

  let resolver = null;

  function closeModal(result) {
    backdrop.classList.add("hidden");
    if (resolver) {
      resolver(result);
      resolver = null;
    }
  }

  cancelBtn.addEventListener("click", () => closeModal(null));
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal(null);
  });
  confirmBtn.addEventListener("click", () => {
    if (!inputEl.hidden) {
      const val = inputEl.value.trim();
      closeModal(val === "" ? null : val);
    } else {
      closeModal(true);
    }
  });

  /** تأكيد بسيط (نعم/لا) */
  function confirmDialog(title, message, confirmLabel = "تأكيد") {
    titleEl.textContent = title;
    messageEl.textContent = message;
    messageEl.hidden = false;
    inputEl.hidden = true;
    confirmBtn.textContent = confirmLabel;
    backdrop.classList.remove("hidden");
    return new Promise((res) => (resolver = res));
  }

  /** نافذة إدخال نص */
  function promptDialog(title, message, placeholder = "", defaultValue = "") {
    titleEl.textContent = title;
    messageEl.textContent = message;
    messageEl.hidden = !message;
    inputEl.hidden = false;
    inputEl.value = defaultValue;
    inputEl.placeholder = placeholder;
    confirmBtn.textContent = "حفظ";
    backdrop.classList.remove("hidden");
    setTimeout(() => inputEl.focus(), 50);
    return new Promise((res) => (resolver = res));
  }

  return { toast, showLoading, hideLoading, confirmDialog, promptDialog };
})();
