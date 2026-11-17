// Build replaces these constants with the complete asset list and its content hash.
const VERSION = 'development';
const ASSETS = ['./', './index.html', './styles.css', './favicon.svg', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png', './src/app.js', './src/calculation-explanation.js', './src/navigation.js', './src/layout.js', './src/pwa.js', './src/content.js', './src/dates.js', './src/pregnancy.js', './src/journal.js', './src/journal-ui.js', './src/calendar.js', './src/calendar-ui.js', './src/reflection.js', './src/reflection-ui.js', './src/guide-data.js', './src/guide.js', './src/guide-ui.js', './src/report.js', './src/report-ui.js', './src/sync.js', './src/sync-ui.js', './src/qr.js', './src/vendor/qrcodegen.js'];
const BASE = new URL('./', self.location.href);
// Scope in the name prevents interference with other apps on the same origin.
const PREFIX = `bauchgefuehl:${BASE.pathname}:`;
const CACHE = PREFIX + VERSION;
const urls = new Set(ASSETS.map(path => new URL(path, BASE).href));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll([...urls])));
});
self.addEventListener('activate', event => {
  // Keep one previous release for open windows; bound storage across updates.
  event.waitUntil((async () => {
    const old = (await caches.keys()).filter(key => key.startsWith(PREFIX) && key !== CACHE);
    await Promise.all(old.slice(0, -1).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE_UPDATE') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== BASE.origin || url.search) return;
  const navigation = request.mode === 'navigate' && (url.pathname === BASE.pathname || url.pathname === new URL('index.html', BASE).pathname);
  // No runtime cache: sync endpoints, arbitrary paths and query URLs pass through.
  if (!navigation && !urls.has(url.href)) return;
  const key = navigation ? new URL('index.html', BASE).href : url.href;
  event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(key)) || fetch(request)));
});
