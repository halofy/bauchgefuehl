// Build replaces these constants with the complete asset list and its content hash.
const VERSION = 'development';
const ASSETS = ['./', './index.html', './styles.css', './favicon.svg', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png', './images/development-mask.svg', './images/development/woche_01.png', './images/development/woche_02.png', './images/development/woche_03.png', './images/development/woche_04.png', './images/development/woche_05.png', './images/development/woche_06.png', './images/development/woche_07.png', './images/development/woche_08.png', './images/development/woche_09.png', './images/development/woche_10.png', './images/development/woche_11.png', './images/development/woche_12.png', './images/development/woche_13.png', './images/development/woche_14.png', './images/development/woche_15.png', './images/development/woche_16.png', './images/development/woche_17.png', './images/development/woche_18.png', './images/development/woche_19.png', './images/development/woche_20.png', './images/development/woche_21.png', './images/development/woche_22.png', './images/development/woche_23.png', './images/development/woche_24.png', './images/development/woche_25.png', './images/development/woche_26.png', './images/development/woche_27.png', './images/development/woche_28.png', './images/development/woche_29.png', './images/development/woche_30.png', './images/development/woche_31.png', './images/development/woche_32.png', './images/development/woche_33.png', './images/development/woche_34.png', './images/development/woche_35.png', './images/development/woche_36.png', './images/development/woche_37.png', './images/development/woche_38.png', './images/development/woche_39.png', './images/development/woche_40.png', './images/development/woche_41.png', './images/development/woche_42.png', './src/app.js', './src/companion.js', './src/companion-ui.js', './src/companion-report.js', './src/growth.js', './src/development-art.js', './src/symptoms.js', './src/trends.js', './src/backup.js', './src/calculation-explanation.js', './src/navigation.js', './src/layout.js', './src/pwa.js', './src/content.js', './src/care.js', './src/care-ui.js', './src/mother.js', './src/mother-ui.js', './src/dates.js', './src/pregnancy.js', './src/journal.js', './src/checkin.js', './src/journal-ui.js', './src/calendar.js', './src/calendar-ui.js', './src/reflection.js', './src/reflection-ui.js', './src/guide-data.js', './src/guide.js', './src/guide-ui.js', './src/report.js', './src/report-ui.js', './src/sync.js', './src/devices-ui.js', './src/device-transfer.js', './src/birth.js', './src/birth-ui.js', './src/qr.js', './src/vendor/qrcodegen.js'];
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
