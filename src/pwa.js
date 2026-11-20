const appDirectory = new URL('../', import.meta.url);
export const isLocalPreview = ['localhost', '127.0.0.1', '[::1]'].includes(appDirectory.hostname)
  && appDirectory.pathname === '/vorschau/';

export function setupPwa() {
  const $ = id => document.getElementById(id);
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  let installPrompt;
  let registration;
  const installed = () => {
    $('app-install').hidden = true;
    $('app-install-help').textContent = 'Du nutzt bauchgefühl bereits als installierte App.';
  };
  if (standalone()) installed();
  $('open-app').addEventListener('click', () => $('app-dialog').showModal());
  const network = () => {
    $('app-network').textContent = navigator.onLine ? 'Online' : 'Du bist offline';
  };
  network();
  window.addEventListener('online', network);
  window.addEventListener('offline', network);
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    if (!standalone()) $('app-install').hidden = false;
  });
  window.addEventListener('appinstalled', installed);
  $('app-install').addEventListener('click', async () => {
    if (!installPrompt) return;
    try { await installPrompt.prompt(); await installPrompt.userChoice; }
    finally { installPrompt = null; $('app-install').hidden = true; }
  });
  $('app-update').addEventListener('click', () => {
    if (!registration?.waiting) return;
    if (!confirm('App neu laden? Bitte speichere zuerst offene Eingaben. Nicht gespeicherte Entwürfe gehen beim Neuladen verloren.')) return;
    // Only the client explicitly accepting the update reloads.
    navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true });
    registration.waiting.postMessage({ type: 'ACTIVATE_UPDATE' });
  });
  if (isLocalPreview) {
    $('app-offline').textContent = 'Die Vorschau lädt den aktuellen lokalen Build. Für Installation und Offline-Tests öffne die App am Stamm der Adresse.';
    return;
  }
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    $('app-offline').textContent = 'Offline-Nutzung und Installation benötigen einen unterstützten Browser und HTTPS (lokal auch localhost).';
    return;
  }
  const waiting = () => {
    if (!registration.waiting || !navigator.serviceWorker.controller) return;
    $('app-update').hidden = false;
    $('app-update-status').textContent = 'Eine neue Version ist bereit. Speichere deine Eingaben, bevor du das Update lädst.';
    $('open-app').classList.add('update-ready');
    $('open-app').setAttribute('aria-label', 'App-Einstellungen · Update verfügbar');
  };
  navigator.serviceWorker.register(new URL('../sw.js', import.meta.url), { updateViaCache: 'none' }).then(value => {
    registration = value;
    waiting();
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', waiting);
    });
    return navigator.serviceWorker.ready;
  }).then(() => {
    $('app-offline').textContent = 'App-Dateien sind für die Offline-Nutzung bereit. Deine Angaben bleiben im lokalen Datenspeicher.';
  }).catch(() => {
    $('app-offline').textContent = 'Offline-Verfügbarkeit konnte nicht eingerichtet werden. Bitte online neu laden; eventuell blockiert der Browser den Speicher.';
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && navigator.onLine) registration?.update().catch(() => {});
  });
}
