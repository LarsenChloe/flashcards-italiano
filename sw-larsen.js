// Service Worker — Italiano Larsen
// Version : à incrémenter à chaque mise à jour du fichier HTML
var CACHE_NAME = 'italiano-larsen-v2';

var FILES_TO_CACHE = [
  '/flashcards-italiano/italiano_larsen.html'
];

// Installation : mise en cache du fichier HTML
self.addEventListener('install', function(event) {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('[SW] Mise en cache de l\'app');
      return cache.addAll(FILES_TO_CACHE);
    }).then(function() {
      // Prendre le contrôle immédiatement sans attendre le rechargement
      return self.skipWaiting();
    })
  );
});

// Activation : supprimer les anciens caches
self.addEventListener('activate', function(event) {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== CACHE_NAME) {
          console.log('[SW] Suppression ancien cache:', key);
          return caches.delete(key);
        }
      }));
    }).then(function() {
      // Prendre le contrôle de tous les clients ouverts
      return self.clients.claim();
    })
  );
});

// Fetch : Cache First — sert depuis le cache, sinon réseau
self.addEventListener('fetch', function(event) {
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      if (cachedResponse) {
        // Servi depuis le cache
        return cachedResponse;
      }
      // Pas en cache : fetch réseau et mettre en cache
      return fetch(event.request).then(function(networkResponse) {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        var responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(function() {
        // Hors ligne et pas en cache : page de fallback minimaliste
        return new Response(
          '<html><body style="font-family:sans-serif;text-align:center;padding:60px">' +
          '<h2>&#127470;&#127481; Italiano — Larsen</h2>' +
          '<p>Ouvre l\'app une première fois avec connexion pour activer le mode hors ligne.</p>' +
          '</body></html>',
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      });
    })
  );
});
