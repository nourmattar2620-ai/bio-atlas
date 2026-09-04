/**
 * المصادقة: دخول المعلم (Firebase Authentication) + جلسة الطالب (كود محفوظ محلياً)
 */
const Auth = (() => {
  const STUDENT_CODE_KEY = "bioatlas_student_code";

  // ---------- المعلم ----------
  function teacherSignIn(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
  }
  function teacherSignOut() {
    return auth.signOut();
  }
  function onTeacherAuthChange(callback) {
    auth.onAuthStateChanged(callback);
  }
  async function changeTeacherPassword(currentPassword, newPassword) {
    const user = auth.currentUser;
    if (!user) throw new Error("لا يوجد مستخدم مسجّل الدخول");
    const cred = firebase.auth.EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    await user.reauthenticateWithCredential(cred);
    await user.updatePassword(newPassword);
  }

  // ---------- الطالب ----------
  function getStudentCode() {
    return localStorage.getItem(STUDENT_CODE_KEY);
  }
  function setStudentCode(code) {
    localStorage.setItem(STUDENT_CODE_KEY, code);
  }
  function clearStudentCode() {
    localStorage.removeItem(STUDENT_CODE_KEY);
  }

  return {
    teacherSignIn, teacherSignOut, onTeacherAuthChange, changeTeacherPassword,
    getStudentCode, setStudentCode, clearStudentCode,
  };
})();
