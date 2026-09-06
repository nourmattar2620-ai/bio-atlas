/**
 * طبقة الوصول للبيانات: Firestore (المحتوى + الأكواد) و Cloudinary (صور الدروس)
 *
 * هيكل البيانات:
 *   classes/{classId}                         { name, order, createdAt }
 *   classes/{classId}/units/{unitId}          { name, order, createdAt }
 *   classes/{classId}/units/{unitId}/lessons/{lessonId}
 *       { name, images:[{id,name,imageURL,imageCloudinaryId,
 *                         labels:[{id,xPct,yPct,wPct,hPct,text,color}]}], order, createdAt }
 *   studentCodes/{code}                       { active, note, createdAt }
 *
 * ملاحظة: حذف الدرس/الوحدة/الصف يحذف مستندات Firestore، لكن الصور على
 * Cloudinary تبقى مخزّنة هناك (الرفع غير الموقّع لا يسمح بالحذف الآمن من
 * المتصفح مباشرة) — هذا غير مكلف إطلاقاً ضمن الحصة المجانية السخية.
 */
const DB = (() => {
  const classesCol = () => db.collection("classes");
  const unitsCol = (classId) => classesCol().doc(classId).collection("units");
  const lessonsCol = (classId, unitId) =>
    unitsCol(classId).doc(unitId).collection("lessons");
  const codesCol = () => db.collection("studentCodes");

  // ---------- الصفوف ----------
  async function getClasses() {
    const snap = await classesCol().orderBy("order", "asc").get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  async function getClass(classId) {
    const doc = await classesCol().doc(classId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }
  async function addClass(name) {
    const count = (await classesCol().get()).size;
    const ref = await classesCol().add({
      name,
      order: count,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return ref.id;
  }
async function deleteClass(classId) {
    const units = await getUnits(classId);
    for (const unit of units) {
      await deleteUnit(classId, unit.id);
    }
    await classesCol().doc(classId).delete();
  }

  // ---------- الوحدات ----------
  async function getUnits(classId) {
    const snap = await unitsCol(classId).orderBy("order", "asc").get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  async function getUnit(classId, unitId) {
    const doc = await unitsCol(classId).doc(unitId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }
  async function addUnit(classId, name) {
    const count = (await unitsCol(classId).get()).size;
    const ref = await unitsCol(classId).add({
      name,
      order: count,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return ref.id;
  }
  async function deleteUnit(classId, unitId) {
    const lessons = await getLessons(classId, unitId);
    for (const lesson of lessons) {
      await deleteLesson(classId, unitId, lesson.id);
    }
    await unitsCol(classId).doc(unitId).delete();
  }

  // ---------- الدروس ----------
  async function getLessons(classId, unitId) {
    const snap = await lessonsCol(classId, unitId).orderBy("order", "asc").get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
async function getLesson(classId, unitId, lessonId) {
    const doc = await lessonsCol(classId, unitId).doc(lessonId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }
  async function addLesson(classId, unitId, name) {
    const count = (await lessonsCol(classId, unitId).get()).size;
    const ref = await lessonsCol(classId, unitId).add({
      name,
      images: [],
      order: count,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return ref.id;
  }
  async function updateLesson(classId, unitId, lessonId, data) {
    await lessonsCol(classId, unitId).doc(lessonId).update(data);
  }
  async function deleteLesson(classId, unitId, lessonId) {
    const lesson = await getLesson(classId, unitId, lessonId);
    if (lesson && Array.isArray(lesson.images)) {
      for (const img of lesson.images) {
        if (img.imageCloudinaryId) {
          await deleteImage(img.imageCloudinaryId).catch(() => {});
        }
      }
    }
    await lessonsCol(classId, unitId).doc(lessonId).delete();
  }

  // ---------- الصور (عبر Cloudinary) ----------
  async function uploadLessonImage(file) {
    const { url, publicId } = await Cloudinary.uploadImage(file);
    return { url, path: publicId };
  }
  async function deleteImage(_path) {
    return Promise.resolve();
  }
