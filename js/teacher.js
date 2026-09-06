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
Router.show("screen-teacher-unit");
    await loadLessons();
  }

  function initDeleteUnit() {
    document.getElementById("btn-delete-unit").addEventListener("click", async () => {
      const ok = await UI.confirmDialog(
        "حذف الوحدة",
        "سيتم حذف كل الدروس والصور داخل هذه الوحدة نهائياً. متابعة؟",
        "حذف نهائي"
      );
      if (!ok) return;
      UI.showLoading("جارٍ الحذف…");
      try {
        await DB.deleteUnit(state.classId, state.unitId);
        UI.toast("تم حذف الوحدة");
        Router.show("screen-teacher-class");
        await loadUnits();
      } catch (err) {
        UI.toast("تعذر الحذف: " + err.message, "error");
      } finally {
        UI.hideLoading();
      }
    });
  }

  // ===================== الدروس =====================
  async function loadLessons() {
    UI.showLoading("جارٍ تحميل الدروس…");
    try {
      const lessons = await DB.getLessons(state.classId, state.unitId);
      const list = document.getElementById("list-lessons");
      list.innerHTML = "";
      document.getElementById("empty-lessons").hidden = lessons.length > 0;
      lessons.forEach((l) => {
        const li = document.createElement("li");
        li.className = "specimen-item";
        li.tabIndex = 0;
        const count = (l.images || []).length;
        const sub = count > 0 ? `${count} رسمة` : "بدون رسومات بعد";
        li.innerHTML = `
          <div>
            <div class="specimen-item-title">${Utils.escapeHtml(l.name)}</div>
            <div class="specimen-item-sub">${sub}</div>
          </div>
          <span class="specimen-item-arrow">‹</span>`;
        li.addEventListener("click", () => openLessonImages(l.id, l.name));
        list.appendChild(li);
      });
    } catch (err) {
      UI.toast("تعذر تحميل الدروس: " + err.message, "error");
    } finally {
      UI.hideLoading();
    }
  }

  function initAddLesson() {
    document.getElementById("btn-add-lesson").addEventListener("click", async () => {
      const name = await UI.promptDialog("إضافة درس جديد", "", "مثال: جهاز الدوران");
      if (!name) return;
      UI.showLoading("جارٍ الإضافة…");
      try {
        const lessonId = await DB.addLesson(state.classId, state.unitId, name);
        await loadLessons();
        UI.toast("تمت إضافة الدرس، أضف رسومات الآن");
        openLessonImages(lessonId, name);
      } catch (err) {
        UI.toast("تعذرت الإضافة: " + err.message, "error");
      } finally {
        UI.hideLoading();
      }
    });
  }

  // ===================== قائمة رسومات الدرس =====================
  async function openLessonImages(lessonId, lessonName) {
    state.lessonId = lessonId;
    UI.showLoading("جارٍ تحميل الرسومات…");
    try {
      const lesson = await DB.getLesson(state.classId, state.unitId, lessonId);
      state.lessonImages = lesson.images || [];
      document.getElementById("teacher-lesson-images-title").textContent = lesson.name;
      renderLessonImagesList();
      Router.show("screen-teacher-lesson-images");
    } catch (err) {
      UI.toast("تعذر تحميل الرسومات: " + err.message, "error");
    } finally {
      UI.hideLoading();
    }
  }

  function renderLessonImagesList() {
    const list = document.getElementById("list-lesson-images");
    list.innerHTML = "";
    document.getElementById("empty-lesson-images").hidden = state.lessonImages.length > 0;
    state.lessonImages.forEach((img) => {
      const li = document.createElement("li");
      li.className = "specimen-item";
      li.tabIndex = 0;
      const thumb = img.imageURL
        ? `<img class="thumb-item-thumb" src="${img.imageURL}" alt="" />`
        : `<div class="thumb-item-placeholder">بدون صورة</div>`;
      li.innerHTML = `
        <div class="thumb-item-body">
          ${thumb}
          <div>
            <div class="specimen-item-title">${Utils.escapeHtml(img.name || "بدون اسم")}</div>
            <div class="specimen-item-sub">${(img.labels || []).length} مسمّى مخفي</div>
          </div>
        </div>
        <button class="thumb-item-delete" type="button" aria-label="حذف الرسمة">🗑</button>`;
      li.querySelector(".thumb-item-delete").addEventListener("click", async (e) => {
        e.stopPropagation();
        const ok = await UI.confirmDialog("حذف الرسمة", "سيتم حذف هذه الرسمة نهائياً. متابعة؟", "حذف نهائي");
        if (!ok) return;
        UI.showLoading("جارٍ الحذف…");
        try {
          if (img.imageCloudinaryId) {
            await DB.deleteImage(img.imageCloudinaryId).catch(() => {});
          }
          state.lessonImages = state.lessonImages.filter((x) => x.id !== img.id);
          await DB.updateLesson(state.classId, state.unitId, state.lessonId, {
            images: state.lessonImages,
          });
          renderLessonImagesList();
        } catch (err) {
          UI.toast("تعذر الحذف: " + err.message, "error");
        } finally {
          UI.hideLoading();
        }
      });
      li.addEventListener("click", () => openImageEditor(img.id));
      list.appendChild(li);
    });
  }

  function initAddImage() {
    document.getElementById("btn-add-image").addEventListener("click", async () => {
      const name = await UI.promptDialog("إضافة رسمة جديدة", "اسم الرسمة (اختياري)", "مثال: جهاز الدوران");
      const newImage = {
        id: Utils.generateId(),
        name: name || "",
        imageURL: null,
        imageCloudinaryId: null,
        labels: [],
      };
      state.lessonImages.push(newImage);
      UI.showLoading("جارٍ الإضافة…");
      try {
        await DB.updateLesson(state.classId, state.unitId, state.lessonId, {
          images: state.lessonImages,
        });
        renderLessonImagesList();
        openImageEditor(newImage.id);
      } catch (err) {
        UI.toast("تعذرت الإضافة: " + err.message, "error");
      } finally {
        UI.hideLoading();
      }
    });
  }

  function initDeleteLesson() {
    document.getElementById("btn-delete-lesson").addEventListener("click", async () => {
      const ok = await UI.confirmDialog("حذف الدرس", "سيتم حذف الدرس وكل رسوماته نهائياً. متابعة؟", "حذف نهائي");
      if (!ok) return;
      UI.showLoading("جارٍ الحذف…");
      try {
        await DB.deleteLesson(state.classId, state.unitId, state.lessonId);
        UI.toast("تم حذف الدرس");
        Router.show("screen-teacher-unit");
        await loadLessons();
      } catch (err) {
        UI.toast("تعذر الحذف: " + err.message, "error");
      } finally {
        UI.hideLoading();
      }
    });
  }
  // ===================== محرر رسمة (رفع صورة + تغبيش) =====================
  function openImageEditor(imageId) {
    const image = state.lessonImages.find((x) => x.id === imageId);
    if (!image) return;
    state.currentImageId = imageId;
    state.imageFile = null;
    state.labels = (image.labels || []).map((l) => ({ ...l }));
    document.getElementById("lesson-editor-title").textContent = image.name || "رسمة بدون اسم";
    document.getElementById("input-lesson-name").value = image.name || "";
    document.getElementById("input-box-color").value = "#0A0A0A";

    const wrap = document.getElementById("lesson-image-wrap");
    const imgEl = document.getElementById("lesson-image-preview");
    const noImgMsg = document.getElementById("lesson-no-image-msg");
    if (image.imageURL) {
      imgEl.src = image.imageURL;
      wrap.classList.remove("hidden");
      noImgMsg.hidden = true;
    } else {
      imgEl.removeAttribute("src");
      wrap.classList.add("hidden");
      noImgMsg.hidden = false;
    }
    document.getElementById("lesson-save-msg").hidden = true;
    renderBoxes();
    Router.show("screen-teacher-lesson-editor");
  }

  function initDeleteImageInEditor() {
    document.getElementById("btn-delete-image").addEventListener("click", async () => {
      const ok = await UI.confirmDialog("حذف الرسمة", "سيتم حذف هذه الرسمة نهائياً. متابعة؟", "حذف نهائي");
      if (!ok) return;
      UI.showLoading("جارٍ الحذف…");
      try {
        const image = state.lessonImages.find((x) => x.id === state.currentImageId);
        if (image && image.imageCloudinaryId) {
          await DB.deleteImage(image.imageCloudinaryId).catch(() => {});
        }
        state.lessonImages = state.lessonImages.filter((x) => x.id !== state.currentImageId);
        await DB.updateLesson(state.classId, state.unitId, state.lessonId, {
          images: state.lessonImages,
        });
        UI.toast("تم حذف الرسمة");
        renderLessonImagesList();
        Router.show("screen-teacher-lesson-images");
      } catch (err) {
        UI.toast("تعذر الحذف: " + err.message, "error");
      } finally {
        UI.hideLoading();
      }
    });
  }

  function initImageUpload() {
    document.getElementById("input-lesson-image").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      state.imageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        const img = document.getElementById("lesson-image-preview");
        img.src = reader.result;
        document.getElementById("lesson-image-wrap").classList.remove("hidden");
        document.getElementById("lesson-no-image-msg").hidden = true;
        state.labels = [];
        renderBoxes();
      };
      reader.readAsDataURL(file);
    });
  }

  // ---------- رسم مربعات التغبيش ----------
  function renderBoxes() {
    const layer = document.getElementById("lesson-boxes-layer");
    layer.innerHTML = "";
    state.labels.forEach((label) => layer.appendChild(buildBoxEl(label)));
  }

  function buildBoxEl(label) {
    const el = document.createElement("div");
    el.className = "label-box editing";
    el.style.left = label.xPct + "%";
    el.style.top = label.yPct + "%";
    el.style.width = label.wPct + "%";
    el.style.height = label.hPct + "%";
    el.style.background = label.color || "#0A0A0A";
    el.dataset.id = label.id;

    const textEl = document.createElement("span");
    textEl.className = "box-text";
    textEl.textContent = label.text || "بدون نص";
    el.appendChild(textEl);

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "box-delete";
    delBtn.textContent = "×";
    delBtn.setAttribute("aria-label", "حذف المربع");
    delBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      state.labels = state.labels.filter((l) => l.id !== label.id);
      renderBoxes();
    });
    el.appendChild(delBtn);

    el.addEventListener("click", async (e) => {
      if (e.target === delBtn) return;
      const text = await UI.promptDialog(
        "نص المسمّى (اختياري، للمرجع فقط)",
        "",
        "مثال: الأذين الأيمن",
        label.text || ""
      );
      if (text !== null) {
        label.text = text;
        renderBoxes();
      }
    });

    return el;
  }

  function initBoxDrawing() {
    const wrap = document.getElementById("lesson-image-wrap");
    const layer = document.getElementById("lesson-boxes-layer");
    let startX = 0, startY = 0, dragging = false, draftEl = null;

    function pointFromEvent(e) {
      const rect = layer.getBoundingClientRect();
      const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
      const y = Math.min(Math.max(e.clientY - rect.top, 0), rect.height);
      return { x, y, rect };
    }

    layer.addEventListener("pointerdown", (e) => {
      if (e.target !== layer) return;
      const { x, y } = pointFromEvent(e);
      startX = x;
      startY = y;
      dragging = true;
      draftEl = document.createElement("div");
      draftEl.className = "label-box";
      draftEl.style.left = x + "px";
      draftEl.style.top = y + "px";
      draftEl.style.width = "0px";
      draftEl.style.height = "0px";
      draftEl.style.background = document.getElementById("input-box-color").value;
      layer.appendChild(draftEl);
      layer.setPointerCapture(e.pointerId);
    });

    layer.addEventListener("pointermove", (e) => {
      if (!dragging || !draftEl) return;
      const { x, y } = pointFromEvent(e);
      const left = Math.min(x, startX);
      const top = Math.min(y, startY);
      const w = Math.abs(x - startX);
      const h = Math.abs(y - startY);
      draftEl.style.left = left + "px";
      draftEl.style.top = top + "px";
      draftEl.style.width = w + "px";
      draftEl.style.height = h + "px";
    });

    async function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      const rect = layer.getBoundingClientRect();
      const boxRect = draftEl.getBoundingClientRect();
      const wPx = boxRect.width, hPx = boxRect.height;
      const chosenColor = document.getElementById("input-box-color").value;
      draftEl.remove();
      draftEl = null;

      if (wPx < 12 || hPx < 12) return;

      const leftPx = boxRect.left - rect.left;
      const topPx = boxRect.top - rect.top;
      const label = {
        id: Utils.generateId(),
        xPct: +((leftPx / rect.width) * 100).toFixed(2),
        yPct: +((topPx / rect.height) * 100).toFixed(2),
        wPct: +((wPx / rect.width) * 100).toFixed(2),
        hPct: +((hPx / rect.height) * 100).toFixed(2),
        text: "",
        color: chosenColor,
      };
      state.labels.push(label);
      renderBoxes();

      const text = await UI.promptDialog(
        "نص المسمّى (اختياري، للمرجع فقط)",
        "اترك الحقل فارغاً وتجاهل إن لم ترغب بتسجيل النص",
        "مثال: الأذين الأيمن"
      );
      if (text) {
        label.text = text;
        renderBoxes();
      }
    }

    layer.addEventListener("pointerup", endDrag);
    layer.addEventListener("pointercancel", endDrag);
  }

  function initBoxControls() {
    document.getElementById("btn-clear-boxes").addEventListener("click", async () => {
      if (state.labels.length === 0) return;
      const ok = await UI.confirmDialog("مسح كل المربعات", "سيتم حذف كل مربعات التغبيش في هذه الرسمة. متابعة؟");
      if (!ok) return;
      state.labels = [];
      renderBoxes();
    });
    document.getElementById("btn-undo-box").addEventListener("click", () => {
      state.labels.pop();
      renderBoxes();
    });
  }

  function initSaveLesson() {
    document.getElementById("btn-save-lesson").addEventListener("click", async () => {
      const name = document.getElementById("input-lesson-name").value.trim();
      UI.showLoading("جارٍ الحفظ…");
      try {
        const idx = state.lessonImages.findIndex((x) => x.id === state.currentImageId);
        if (idx === -1) throw new Error("تعذر إيجاد الرسمة");
        const image = state.lessonImages[idx];

        if (state.imageFile) {
          if (image.imageCloudinaryId) {
            await DB.deleteImage(image.imageCloudinaryId).catch(() => {});
          }
          const { url, path } = await DB.uploadLessonImage(state.imageFile);
          image.imageURL = url;
          image.imageCloudinaryId = path;
        }

        image.name = name;
        image.labels = state.labels;
        state.lessonImages[idx] = image;

        await DB.updateLesson(state.classId, state.unitId, state.lessonId, {
          images: state.lessonImages,
        });
        state.imageFile = null;
        UI.toast("تم حفظ الرسمة بنجاح");
        const msg = document.getElementById("lesson-save-msg");
        msg.textContent = "آخر حفظ: الآن";
        msg.hidden = false;
      } catch (err) {
        UI.toast("تعذر الحفظ: " + err.message, "error");
      } finally {
        UI.hideLoading();
      }
    });
  }

  // ===================== أكواد الطلاب =====================
  async function loadCodes() {
    UI.showLoading("جارٍ تحميل الأكواد…");
    try {
      const codes = await DB.getCodes();
      const list = document.getElementById("list-codes");
      list.innerHTML = "";
      document.getElementById("empty-codes").hidden = codes.length > 0;
      codes.forEach((c) => {
        const li = document.createElement("li");
        li.className = "specimen-item code-item";
        li.innerHTML = `
          <div>
            <div class="code-value">${c.code}</div>
            <div class="specimen-item-sub">${c.active === false ? "معطّل" : "فعّال"}${c.note ? " · " + Utils.escapeHtml(c.note) : ""}</div>
          </div>
          <div class="code-actions">
            <button class="btn btn-ghost btn-sm" data-action="toggle">${c.active === false ? "تفعيل" : "تعطيل"}</button>
            <button class="btn btn-danger-ghost btn-sm" data-action="delete">حذف</button>
          </div>`;
        li.querySelector('[data-action="toggle"]').addEventListener("click", async () => {
          await DB.toggleCode(c.code, c.active === false);
          loadCodes();
        });
        li.querySelector('[data-action="delete"]').addEventListener("click", async () => {
          const ok = await UI.confirmDialog("حذف الكود", `سيتم حذف الكود ${c.code} نهائياً.`, "حذف");
          if (!ok) return;
          await DB.deleteCode(c.code);
          loadCodes();
        });
        list.appendChild(li);
      });
    } catch (err) {
      UI.toast("تعذر تحميل الأكواد: " + err.message, "error");
    } finally {
      UI.hideLoading();
    }
  }

  function initGenerateCode() {
    document.getElementById("btn-generate-code").addEventListener("click", async () => {
      const note = await UI.promptDialog("توليد كود جديد", "اسم الطالب (اختياري)", "مثال: أحمد");
      UI.showLoading("جارٍ التوليد…");
      try {
        const code = await DB.generateCode(note || "");
        UI.toast("تم توليد الكود: " + code);
        loadCodes();
      } catch (err) {
        UI.toast("تعذر التوليد: " + err.message, "error");
      } finally {
        UI.hideLoading();
      }
    });
  }

  // ===================== الإعدادات: تغيير كلمة السر =====================
  function initChangePassword() {
    document.getElementById("form-change-password").addEventListener("submit", async (e) => {
      e.preventDefault();
      const current = document.getElementById("input-current-password").value;
      const next = document.getElementById("input-new-password").value;
      const msg = document.getElementById("password-change-msg");
      UI.showLoading("جارٍ التحديث…");
      try {
        await Auth.changeTeacherPassword(current, next);
        msg.textContent = "تم تغيير كلمة السر بنجاح";
        msg.hidden = false;
        e.target.reset();
      } catch (err) {
        msg.textContent = "تعذر التغيير: تأكد من كلمة السر الحالية";
        msg.hidden = false;
      } finally {
        UI.hideLoading();
      }
    });
  }

  function init() {
    initLoginForm();
    initTabs();
    initAddClass();
    initDeleteClass();
    initAddUnit();
    initDeleteUnit();
    initAddLesson();
    initDeleteLesson();
    initAddImage();
    initDeleteImageInEditor();
    initImageUpload();
    initBoxDrawing();
    initBoxControls();
    initSaveLesson();
    initGenerateCode();
    initChangePassword();
  }

  return { init, enterDashboard };
})();
