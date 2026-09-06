/**
 * واجهة المعلم بالكامل
 */
const Teacher = (() => {
  const state = {
    classId: null,
    unitId: null,
    lessonId: null,
    lessonImages: [],
    currentImageId: null,
    labels: [],
    imageFile: null,
    draft: null,
  };

  // ===================== الدخول =====================
  function initLoginForm() {
    document
      .getElementById("form-teacher-login")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("input-teacher-email").value.trim();
        const password = document.getElementById("input-teacher-password").value;
        const errorEl = document.getElementById("teacher-login-error");
        errorEl.hidden = true;
        UI.showLoading("جارٍ التحقق…");
        try {
          await Auth.teacherSignIn(email, password);
        } catch (err) {
          errorEl.textContent = "البريد أو كلمة السر غير صحيحة";
          errorEl.hidden = false;
        } finally {
          UI.hideLoading();
        }
      });

    document.getElementById("btn-teacher-logout").addEventListener("click", async () => {
      await Auth.teacherSignOut();
      Router.show("screen-student-login", { resetHistory: true });
    });
  }

  // ===================== لوحة التحكم: تبويبات =====================
  function initTabs() {
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
        document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
        tab.classList.add("active");
        document.getElementById(tab.dataset.panel).classList.add("active");
        if (tab.dataset.panel === "panel-codes") loadCodes();
      });
    });
  }

  async function enterDashboard(user) {
    document.getElementById("teacher-email-label").textContent = user.email;
    Router.show("screen-teacher-dashboard", { resetHistory: true });
    await loadClasses();
  }

  // ===================== الصفوف =====================
  async function loadClasses() {
    UI.showLoading("جارٍ تحميل الصفوف…");
    try {
      const classes = await DB.getClasses();
      const list = document.getElementById("list-classes");
      list.innerHTML = "";
      document.getElementById("empty-classes").hidden = classes.length > 0;
      classes.forEach((c) => {
        const li = document.createElement("li");
        li.className = "specimen-item";
        li.tabIndex = 0;
        li.innerHTML = `
          <div>
            <div class="specimen-item-title">${Utils.escapeHtml(c.name)}</div>
          </div>
          <span class="specimen-item-arrow">‹</span>`;
        li.addEventListener("click", () => openClass(c.id, c.name));
        list.appendChild(li);
      });
    } catch (err) {
      UI.toast("تعذر تحميل الصفوف: " + err.message, "error");
    } finally {
      UI.hideLoading();
    }
  }

  function initAddClass() {
    document.getElementById("btn-add-class").addEventListener("click", async () => {
      const name = await UI.promptDialog("إضافة صف جديد", "", "مثال: الصف العاشر");
      if (!name) return;
      UI.showLoading("جارٍ الإضافة…");
      try {
        await DB.addClass(name);
        await loadClasses();
        UI.toast("تمت إضافة الصف");
      } catch (err) {
        UI.toast("تعذرت الإضافة: " + err.message, "error");
      } finally {
        UI.hideLoading();
      }
    });
  }

  async function openClass(classId, className) {
    state.classId = classId;
    document.getElementById("teacher-class-title").textContent = className;
    Router.show("screen-teacher-class");
    await loadUnits();
  }

  function initDeleteClass() {
    document.getElementById("btn-delete-class").addEventListener("click", async () => {
      const ok = await UI.confirmDialog(
        "حذف الصف",
        "سيتم حذف كل الوحدات والدروس والصور داخل هذا الصف نهائياً. متابعة؟",
        "حذف نهائي"
      );
      if (!ok) return;
      UI.showLoading("جارٍ الحذف…");
      try {
        await DB.deleteClass(state.classId);
        UI.toast("تم حذف الصف");
        Router.show("screen-teacher-dashboard");
        await loadClasses();
      } catch (err) {
        UI.toast("تعذر الحذف: " + err.message, "error");
      } finally {
        UI.hideLoading();
      }
    });
  }

  // ===================== الوحدات =====================
  async function loadUnits() {
    UI.showLoading("جارٍ تحميل الوحدات…");
    try {
      const units = await DB.getUnits(state.classId);
      const list = document.getElementById("list-units");
      list.innerHTML = "";
      document.getElementById("empty-units").hidden = units.length > 0;
      units.forEach((u) => {
        const li = document.createElement("li");
        li.className = "specimen-item";
        li.tabIndex = 0;
        li.innerHTML = `
          <div class="specimen-item-title">${Utils.escapeHtml(u.name)}</div>
          <span class="specimen-item-arrow">‹</span>`;
        li.addEventListener("click", () => openUnit(u.id, u.name));
        list.appendChild(li);
      });
    } catch (err) {
      UI.toast("تعذر تحميل الوحدات: " + err.message, "error");
    } finally {
      UI.hideLoading();
    }
  }

  function initAddUnit() {
    document.getElementById("btn-add-unit").addEventListener("click", async () => {
      const name = await UI.promptDialog("إضافة وحدة جديدة", "", "مثال: الوحدة الأولى - الخلية");
      if (!name) return;
      UI.showLoading("جارٍ الإضافة…");
      try {
        await DB.addUnit(state.classId, name);
        await loadUnits();
        UI.toast("تمت إضافة الوحدة");
      } catch (err) {
        UI.toast("تعذرت الإضافة: " + err.message, "error");
      } finally {
        UI.hideLoading();
      }
    });
  }

  async function openUnit(unitId, unitName) {
    state.unitId = unitId;
    document.getElementById("teacher-unit-title").textContent = unitName;
