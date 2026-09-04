/**
 * موجّه بسيط للتنقل بين الشاشات (SPA بدون مكتبات)
 */
const Router = (() => {
  let history = ["screen-student-login"];

  function show(screenId, { resetHistory = false } = {}) {
    document.querySelectorAll(".screen").forEach((el) => {
      el.classList.toggle("active", el.id === screenId);
    });
    if (resetHistory) {
      history = [screenId];
    } else if (history[history.length - 1] !== screenId) {
      history.push(screenId);
    }
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  function back(fallbackId) {
    history.pop(); // إزالة الشاشة الحالية
    const target = history[history.length - 1] || fallbackId;
    show(target);
  }

  function current() {
    return history[history.length - 1];
  }

  // ربط كل أزرار "رجوع" ذات data-back-to
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-back-to]");
    if (btn) {
      back(btn.dataset.backTo);
    }
  });

  return { show, back, current };
})();
