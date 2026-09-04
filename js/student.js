/**
 * واجهة الطالب بالكامل
 */
const Student = (() => {
  const state = { classId: null, unitId: null, lessonId: null };

  function initLoginForm() {
    document.getElementById("form-student-login").addEventListener("submit", async (e) => {
      e.preventDefault();
      const raw = document.getElementById("input-student-code").value.trim().toUpperCase();
      const errorEl = document.getElementById("student-login-error");
      errorEl.hidden = true;
      if (!raw) return;
      UI.showLoading("جارٍ التحقق من الكود…");
      try {
        const valid = await DB.validateCode(raw);
        if (!valid) {
          errorEl.textContent = "الكود غير صحيح أو غير مفعّل، تأكد منه مع معلمك";
          errorEl.hidden = false;
          return;
        }
        Auth.setStudentCode(raw);
        await enterClasses();
      } catch (err) {
        errorEl.textContent = "تعذر التحقق، تأكد من اتصالك بالإنترنت";
        errorEl.hidden = false;
      } finally {
        UI.hideLoading();
      }
    });

    document.getElementById("btn-student-logout").addEventListener("click", () => {
      Auth.clearStuden
