/**
 * دوال مساعدة عامة
 */
const Utils = (() => {
  const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // بدون أحرف/أرقام ملتبسة (O/0, I/1)

  function generateStudentCode() {
    let code = "BIO-";
    for (let i = 0; i < 6; i++) {
      code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
    return code;
  }

  function generateId() {
    return (
      Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
    );
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }

  function debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  return { generateStudentCode, generateId, escapeHtml, debounce };
})();
