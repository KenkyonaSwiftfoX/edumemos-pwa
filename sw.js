const CACHE_NAME = "edumemos-v1";

// Chemins absolus adaptés à ton sous-dossier Alwaysdata
const ASSETS = [
  "/edumemos/",
  "/edumemos/index.html",
  "/edumemos/style.css",
  "/edumemos/index.js",
  "/edumemos/manifest.json",
  "/edumemos/icons/icon-192.png",
  "/edumemos/icons/icon-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap",
];

// 1. Événement d'installation
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Mise en cache des ressources");
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting()), // Force le SW à devenir actif immédiatement
  );
});

// 2. Événement d'activation
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log("Service Worker: Suppression de l'ancien cache", key);
              return caches.delete(key);
            }
          }),
        );
      })
      .then(() => self.clients.claim()), // Prend le contrôle des pages immédiatement
  );
});

// 3. Stratégie de Fetch
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    }),
  );
});
