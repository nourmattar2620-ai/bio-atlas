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
