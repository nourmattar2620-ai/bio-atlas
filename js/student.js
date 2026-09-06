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
      Auth.clearStudentCode();
      Router.show("screen-student-login", { resetHistory: true });
    });
  }

  function initTeacherLoginLink() {
    document.getElementById("btn-open-teacher-login").addEventListener("click", () => {
      Router.show("screen-teacher-login");
    });
  }

  async function enterClasses() {
    Router.show("screen-student-classes", { resetHistory: true });
    UI.showLoading("جارٍ تحميل الصفوف…");
    try {
      const classes = await DB.getClasses();
      const list = document.getElementById("list-student-classes");
      list.innerHTML = "";
      document.getElementById("empty-student-classes").hidden = classes.length > 0;
      classes.forEach((c) => {
        const li = document.createElement("li");
        li.className = "specimen-item";
        li.tabIndex = 0;
        li.innerHTML = `<div class="specimen-item-title">${Utils.escapeHtml(c.name)}</div><span class="specimen-item-arrow">‹</span>`;
        li.addEventListener("click", () => openClass(c.id, c.name));
        list.appendChild(li);
      });
    } catch (err) {
      UI.toast("تعذر تحميل الصفوف: " + err.message, "error");
    } finally {
      UI.hideLoading();
    }
  }

  async function openClass(classId, className) {
    state.classId = classId;
    document.getElementById("student-class-title").textContent = className;
    Router.show("screen-student-units");
    UI.showLoading("جارٍ تحميل الوحدات…");
    try {
      const units = await DB.getUnits(classId);
      const list = document.getElementById("list-student-units");
      list.innerHTML = "";
      document.getElementById("empty-student-units").hidden = units.length > 0;
      units.forEach((u) => {
        const li = document.createElement("li");
        li.className = "specimen-item";
        li.tabIndex = 0;
        li.innerHTML = `<div class="specimen-item-title">${Utils.escapeHtml(u.name)}</div><span class="specimen-item-arrow">‹</span>`;
        li.addEventListener("click", () => openUnit(u.id, u.name));
        list.appendChild(li);
      });
    } catch (err) {
      UI.toast("تعذر تحميل الوحدات: " + err.message, "error");
    } finally {
      UI.hideLoading();
    }
  }
