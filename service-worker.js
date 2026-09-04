/**
 * Service Worker بسيط
 * يخزّن هيكل التطبيق (الواجهة) مؤقتاً ليعمل عند ضعف الاتصال
 */
const CACHE_NAME = "bioatlas-shell-v1";
const SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/firebase-config.js",
  "./js/cloudinary-config.js",
  "./js/cloudinary.js",
  "./js/utils.js",
  "./js/ui.js",
  "./js/router.js",
  "./js/db.js",
  "./js/auth.js",
  "./js/teacher.js",
  "./js/student.js",
  "./js/app.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
