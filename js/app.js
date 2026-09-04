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
