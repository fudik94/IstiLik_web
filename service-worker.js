// service-worker.js
// Caches all static assets for offline use.
var CACHE_NAME = 'istilik-v1';
var ASSETS_TO_CACHE = [
  'index.html',
  'css/style.css',
  'js/calculator.js',
  'js/translations.js',
  'js/app.js',
  'manifest.json'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});
