const CACHE_NAME = "edumemos-v1";
// Liste des fichiers indispensables à mettre en cache pour le mode offline
const ASSETS = [
  "./index.html",
  "./style.css",
  "./index.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap",
];

// 1. Événement d'installation : on met les fichiers en cache
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Mise en cache des ressources");
      return cache.addAll(ASSETS);
    }),
  );
});

// 2. Événement d'activation : on nettoie les anciens caches si nécessaire
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Service Worker: Suppression de l'ancien cache", key);
            return caches.delete(key);
          }
        }),
      );
    }),
  );
});

// 3. Stratégie de Fetch (Cache First / Network Fallback)
// Si le fichier est dans le cache, on le sert immédiatement (gaspille moins de réseau et fonctionne offline)
// Sinon, on va le chercher sur internet
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    }),
  );
});
