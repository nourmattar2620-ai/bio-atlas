/**
 * رفع الصور إلى Cloudinary عبر "رفع غير موقّع" (unsigned upload)
 */
const Cloudinary = (() => {
  async function uploadImage(file) {
    if (
      !CLOUDINARY_CLOUD_NAME ||
      CLOUDINARY_CLOUD_NAME.startsWith("ضع-هنا") ||
      !CLOUDINARY_UPLOAD_PRESET ||
      CLOUDINARY_UPLOAD_PRESET.startsWith("ضع-هنا")
    ) {
      throw new Error("لم يتم إعداد Cloudinary بعد — راجع ملف js/cloudinary-config.js");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "bioatlas_lessons");

    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const res = await fetch(endpoint, { method: "POST", body: formData });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(
        errBody?.error?.message || "تعذر رفع الصورة، تأكد من إعدادات Cloudinary"
      );
    }

    const data = await res.json();
    return { url: data.secure_url, publicId: data.public_id };
  }

  return { uploadImage };
})();
