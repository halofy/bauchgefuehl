// Build replaces these constants with the complete asset list and its content hash.
const VERSION = 'development';
const ASSETS = ['./src/transfer-selection.js', './src/knowledge.js', './src/knowledge-ui.js', './images/stages/zyklusbeginn.webp', './images/stages/zyklusvorbereitung.webp', './images/stages/stadium-01.webp', './images/stages/stadium-02.webp', './images/stages/stadium-03.webp', './images/stages/stadium-04.webp', './images/stages/stadium-05.webp', './images/stages/stadium-06.webp', './images/stages/stadium-07.webp', './images/stages/stadium-09.webp', './images/stages/stadium-10.webp', './images/stages/stadium-11.webp', './images/stages/stadium-12.webp', './images/stages/stadium-13.webp', './images/stages/stadium-14.webp', './images/stages/stadium-15.webp', './images/stages/stadium-16.webp', './images/stages/stadium-17.webp', './images/stages/stadium-18.webp', './images/stages/stadium-19.webp', './images/stages/stadium-20.webp', './images/stages/stadium-21.webp', './images/stages/stadium-22.webp', './images/stages/stadium-23.webp', './images/stages/stadium-24.webp', './images/stages/stadium-25.webp', './images/stages/stadium-26.webp', './images/stages/stadium-27.webp', './images/stages/stadium-28.webp', './images/stages/stadium-29.webp', './images/stages/stadium-30.webp', './images/stages/stadium-31.webp', './images/stages/stadium-32.webp', './images/stages/stadium-33.webp', './images/stages/stadium-34.webp', './images/stages/stadium-35.webp', './images/stages/stadium-37.webp', './images/stages/stadium-38.webp', './images/stages/stadium-39.webp', './images/stages/stadium-40.webp', './images/stages/stadium-41.webp', './images/stages/stadium-42.webp', './src/day-press.js', './src/text-format.js', './src/appointment-pdf.js', './src/vendor/jspdf.umd.min.js', './src/vendor/NotoSans-Regular.ttf', './', './index.html', './styles.css', './favicon.svg', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png', './src/app.js', './src/companion.js', './src/companion-ui.js', './src/companion-report.js', './src/growth.js', './src/development-art.js', './src/symptoms.js', './src/trends.js', './src/backup.js', './src/calculation-explanation.js', './src/navigation.js', './src/layout.js', './src/pwa.js', './src/content.js', './src/care.js', './src/care-ui.js', './src/mother.js', './src/mother-ui.js', './src/dates.js', './src/pregnancy.js', './src/journal.js', './src/checkin.js', './src/journal-ui.js', './src/calendar.js', './src/calendar-ui.js', './src/reflection.js', './src/reflection-ui.js', './src/guide-data.js', './src/guide.js', './src/guide-ui.js', './src/report.js', './src/report-ui.js', './src/sync.js', './src/devices-ui.js', './src/device-transfer.js', './src/birth.js', './src/birth-ui.js', './src/qr.js', './src/vendor/qrcodegen.js'];
const BASE = new URL('./', self.location.href);
// Scope in the name prevents interference with other apps on the same origin.
const PREFIX = `bauchgefuehl:${BASE.pathname}:`;
const CACHE = PREFIX + VERSION;
const urls = new Set(ASSETS.map(path => new URL(path, BASE).href));
// Fetch one complete release without mixing stale HTTP-cache modules into it.
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll([...urls].map(url => new Request(url, { cache: 'reload' })))));
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
