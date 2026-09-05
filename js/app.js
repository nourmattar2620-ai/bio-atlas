/**
 * نقطة انطلاق التطبيق
 */
document.addEventListener("DOMContentLoaded", () => {
  Teacher.init();
  Student.init();

  Auth.onTeacherAuthChange((user) => {
    if (user) {
      Teacher.enterDashboard(user);
    } else if (
      Router.current() === "screen-teacher-dashboard" ||
      Router.current() === "screen-teacher-class" ||
      Router.current() === "screen-teacher-unit" ||
      Router.current() === "screen-teacher-lesson-editor"
    ) {
      Router.show("screen-teacher-login", { resetHistory: true });
    }
  });

  const savedCode = Auth.getStudentCode();
  if (savedCode) {
    Student.enterClasses();
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {
    });
  });
}
