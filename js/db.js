/**
 * طبقة الوصول للبيانات: Firestore (المحتوى + الأكواد) و Cloudinary (صور الدروس)
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
    const snap = await unitsCol(classId).orderBy
