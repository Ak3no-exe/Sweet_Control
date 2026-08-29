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
  /* Pas de skipWaiting() ici : si GitHub a une nouvelle version du
     Service Worker, elle reste "en attente" et ne prend jamais le
     contrôle toute seule. Seul le bouton "Vérifier les mises à jour"
     (qui désinstalle puis réinstalle proprement) déclenche la bascule. */
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

/* Stratégie : cache d'abord (l'appli reste figée sur la version installée
   et ne se met JAMAIS à jour toute seule). Le réseau n'est utilisé que
   si le fichier n'est pas encore en cache, ou en secours hors-ligne.
   La seule façon de récupérer une nouvelle version est le bouton
   "Vérifier les mises à jour" dans Paramètres, qui vide le cache lui-même. */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
          return response;
        })
        .catch(() => cached);
    })
  );
});

/* Réception des messages envoyés depuis la page */
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data) return;

  /* Utilisé par le bouton "Vérifier les mises à jour" pour forcer
     ce SW à prendre le contrôle immédiatement une fois réinstallé. */
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (data.type === 'SHOW_NOTIFICATION') {
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
