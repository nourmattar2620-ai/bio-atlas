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

  async function openUnit(unitId, unitName) {
    state.unitId = unitId;
    document.getElementById("student-unit-title").textContent = unitName;
    Router.show("screen-student-lessons");
    UI.showLoading("جارٍ تحميل الدروس…");
    try {
      const lessons = await DB.getLessons(state.classId, unitId);
      const list = document.getElementById("list-student-lessons");
      list.innerHTML = "";
      const withImages = lessons.filter((l) => l.imageURL);
      document.getElementById("empty-student-lessons").hidden = withImages.length > 0;
      withImages.forEach((l) => {
        const li = document.createElement("li");
        li.className = "specimen-item";
        li.tabIndex = 0;
        li.innerHTML = `<div class="specimen-item-title">${Utils.escapeHtml(l.name)}</div><span class="specimen-item-arrow">‹</span>`;
        li.addEventListener("click", () => openViewer(l));
        list.appendChild(li);
      });
    } catch (err) {
      UI.toast("تعذر تحميل الدروس: " + err.message, "error");
    } finally {
      UI.hideLoading();
    }
  }

  function openViewer(lesson) {
    state.lessonId = lesson.id;
    document.getElementById("student-lesson-title").textContent = lesson.name;
    const img = document.getElementById("viewer-image");
    img.src = lesson.imageURL;
    renderViewerBoxes(lesson.labels || []);
    Router.show("screen-student-viewer");
  }

  function renderViewerBoxes(labels) {
    const layer = document.getElementById("viewer-boxes-layer");
    layer.innerHTML = "";
    labels.forEach((label) => {
      const el = document.createElement("div");
      el.className = "label-box";
      el.style.left = label.xPct + "%";
      el.style.top = label.yPct + "%";
      el.style.width = label.wPct + "%";
      el.style.height = label.hPct + "%";
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", "انقر لإظهار المسمّى");
      el.addEventListener("click", () => el.classList.toggle("revealed"));
      layer.appendChild(el);
    });
  }

  function initResetViewer() {
    document.getElementById("btn-reset-viewer").addEventListener("click", () => {
      document.querySelectorAll("#viewer-boxes-layer .label-box").forEach((el) =>
        el.classList.remove("revealed")
      );
    });
  }

  function init() {
    initLoginForm();
    initTeacherLoginLink();
    initResetViewer();
  }

  return { init, enterClasses };
})();
