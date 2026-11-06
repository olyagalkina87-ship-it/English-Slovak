// Кэш для работы без интернета. Если обновили index.html, поменяйте номер версии ниже.
var V = 'cards-v1';
var FILES = ['./', 'index.html', 'manifest.json', 'icon.svg'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(FILES); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

// Сначала сеть (чтобы видеть обновления), при отсутствии интернета — кэш.
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function (r) {
      var copy = r.clone();
      caches.open(V).then(function (c) { c.put(e.request, copy); }).catch(function () {});
      return r;
    }).catch(function () { return caches.match(e.request); })
  );
});
