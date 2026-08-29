/* Service Worker - NØVΛX ESPORT
   Rôle :
   1) Mettre en cache les fichiers de l'appli pour un chargement rapide
      et un fonctionnement minimal hors-ligne.
   2) Afficher les notifications "natives" demandées par la page
      (nouveau joueur ajouté), via postMessage.
*/

const CACHE_NAME = 'novax-esport-v2';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* Stratégie : réseau d'abord, cache en secours (pour rester à jour
   quand il y a du réseau, et fonctionner quand même hors-ligne). */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

/* Permet à la page de forcer ce SW à prendre le contrôle immédiatement
   (utilisé par le bouton "Vérifier les mises à jour"). */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* Réception d'une demande de notification depuis la page */
self.addEventListener('message', (event) => {
  const data = event.data;
  if (data && data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag } = data.payload || {};
    self.registration.showNotification(title || 'NØVΛX ESPORT', {
      body: body || '',
      tag: tag || 'novax-notification',
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      vibrate: [80, 40, 80]
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientsArr) => {
      const client = clientsArr.find((c) => 'focus' in c);
      if (client) return client.focus();
      return self.clients.openWindow('./index.html');
    })
  );
});
