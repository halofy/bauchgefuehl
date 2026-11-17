import { SyncEngine, SYNC_KEY, invitation, parseInvitation, validateConnection, snapshot } from './sync.js';
import { HISTORY_KEY, todayISO } from './pregnancy.js';
import { createQrSvg } from './qr.js';

export function setupSync({ storage, getSnapshot, applySnapshot, notify, onConnection }) {
  const $ = selector => document.querySelector(selector);
  const localEndpoint = document.querySelector('meta[name="local-sync-endpoint"]')?.content;
  if (localEndpoint) {
    $('#sync-endpoint').value = localEndpoint;
    $('#sync-service-hint').textContent = 'Lokaler Sync-Dienst auf diesem Rechner. Den Einrichtungsschlüssel findest du im Datenordner des Servers in der Datei „admin-token“. Standard: .local-sync/admin-token.';
  }
  let engine;
  let candidate = null;
  let recovery = null;
  let working = false;
  let leaseRoom = null;
  let leaseHeld = false;
  let releaseLease = null;
  let backupOffered = false;
  let backupSignature = null;
  let loadProblem = false;
  let status = 'Nicht verbunden · deine Daten bleiben auf diesem Gerät.';
  function error(message) { $('#sync-error').textContent = message; $('#sync-error').hidden = !message; }
  function signature() {
    try { return JSON.stringify([storage.getItem('bauchgefuehl.v1'), storage.getItem(SYNC_KEY)]); }
    catch { return null; }
  }
  function readOnly() { return engine?.connection?.role === 'follower' || (engine?.connection?.role === 'master' && !leaseHeld); }
  function ensureLease() {
    const c = engine?.connection;
    if (!c || c.role !== 'master') {
      releaseLease?.(); releaseLease = null; leaseRoom = null; leaseHeld = false;
      return;
    }
    if (leaseRoom === c.room) return;
    releaseLease?.(); releaseLease = null; leaseHeld = false; leaseRoom = c.room;
    if (!navigator.locks?.request) { status = 'Dieser Browser kann den Master nicht sicher auf einen Tab begrenzen. Bitte einen aktuellen Browser verwenden.'; return; }
    const room = c.room;
    void navigator.locks.request(`bauchgefuehl-master:${c.endpoint}:${room}`, { ifAvailable: true }, async lock => {
      if (!lock) { leaseRoom = null; status = 'Der Master ist in einem anderen Tab geöffnet. Dieser Tab liest nur mit; schließe den anderen Master-Tab zum Bearbeiten.'; update(false); return; }
      if (engine.connection?.room !== room) return;
      leaseHeld = true;
      status = 'Master aktiv · Verbindungsprüfung läuft.';
      update(false);
      void engine.tick();
      await new Promise(resolve => { releaseLease = resolve; });
    }).catch(() => { leaseRoom = null; leaseHeld = false; status = 'Master-Sperre konnte nicht eingerichtet werden. Änderungen bleiben gesperrt.'; update(false); });
  }
  function update(acquire = true) {
    if (acquire) ensureLease();
    if (backupOffered && backupSignature !== signature()) backupOffered = false;
    $('#sync-disconnect-backed-up').hidden = !backupOffered;
    const c = engine?.connection;
    $('#sync-status').textContent = status;
    $('#sync-role').textContent = c ? (c.role === 'master' ? 'Master' : 'Mitlesendes Gerät') : 'Geräte verbinden';
    $('#sync-setup').hidden = !!c || !!candidate || !!recovery;
    $('#sync-manage').hidden = !c;
    $('#sync-candidate').hidden = !candidate;
    $('#sync-recovery').hidden = !recovery;
    $('#sync-disconnect').disabled = working || !!engine?.busy;
    $('#sync-create').disabled = working || !engine;
    $('#sync-join').disabled = working || !!c || !engine;
    $('#sync-restore').disabled = working || !!c || !engine;
    $('#sync-pair').hidden = !c || c.role !== 'master' || !c.ready;
    $('#sync-use-server').hidden = !c || c.role !== 'master';
    $('#sync-manage-description').textContent = c?.role === 'master'
      ? 'Dieses Gerät ist der Master. Nur hier werden Berechnung, Journal und Merkhäkchen geändert. Lade eine Master-Sicherung herunter: Sie enthält auch die Schlüssel für eine Wiederherstellung.'
      : 'Dieses Gerät liest den Masterstand automatisch nach. Berechnung, Journal und Merkhäkchen können nur am Master geändert werden. Offline bleibt der zuletzt empfangene Stand sichtbar.';
    if (c?.role === 'master' && c.ready) {
      const link = invitation(c, location.href);
      if ($('#sync-link').value !== link) {
        $('#sync-link').value = link;
        try { $('#sync-qr').innerHTML = createQrSvg(link); } catch { $('#sync-qr').textContent = 'QR-Code nicht verfügbar. Bitte den Geräte-Link kopieren.'; }
      }
      $('#sync-local-warning').hidden = !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
    }
    onConnection(c, readOnly());
  }
  try {
    engine = new SyncEngine({ storage, getSnapshot, applySnapshot, onStatus(message) { status = message; update(); } });
    if (engine.connection) status = engine.connection.role === 'master' ? 'Master · Verbindungsprüfung läuft.' : 'Mitlesend · Verbindungsprüfung läuft.';
  } catch (cause) {
    loadProblem = true;
    status = 'Geräteverbindung konnte nicht geladen werden. Deine Angaben bleiben erhalten. Backup herunterladen.';
    error(cause.message);
    // Keep the damaged raw record for export; only an explicit operation after
    // a backup may replace it. Recovery must not require deleting browser data.
    engine = new SyncEngine({
      storage: { getItem: () => null, setItem: (key, value) => storage.setItem(key, value), removeItem: key => storage.removeItem(key) },
      getSnapshot, applySnapshot,
      onStatus(message) { status = message; update(); },
    });
  }
  function open() {
    error(''); update();
    $('#sync-dialog').showModal();
  }
  async function run(action) {
    if (working) return;
    working = true; error(''); update();
    try { await action(); }
    catch (cause) { error(cause.message); }
    finally { working = false; update(); }
  }
  $('#open-sync').addEventListener('click', open);
  $('#sync-create-form').addEventListener('submit', event => {
    event.preventDefault();
    void run(async () => {
      if (loadProblem && !backupOffered) throw new Error('Bitte zuerst ein Backup mit dem noch vorhandenen Verbindungsdatensatz herunterladen.');
      snapshot(getSnapshot()); // Never create a room for an empty demo.
      const secret = $('#sync-admin').value;
      $('#sync-admin').value = '';
      await engine.create($('#sync-endpoint').value.trim(), secret);
      loadProblem = false;
    });
  });
  $('#sync-join').addEventListener('click', () => void run(async () => {
    if (!candidate) return;
    await engine.join(candidate);
    candidate = null;
    history.replaceState(null, '', location.pathname + location.search);
    notify('Masterstand übernommen. Der vorherige lokale Stand liegt im Sicherungsverlauf.');
  }));
  $('#sync-reject').addEventListener('click', () => {
    candidate = null;
    history.replaceState(null, '', location.pathname + location.search);
    update();
  });
  $('#sync-disconnect').addEventListener('click', () => void run(async () => {
    // Never drop the only copy of a queued or unconfirmed update.
    if (engine.connection?.pending || engine.connection?.inflight) throw new Error('Es gibt noch nicht bestätigte Änderungen. Lade zuerst die Master-Sicherung herunter. Bei einem Konflikt kannst du nach dem Backup die Verbindung über „Gesicherte Verbindung trennen“ lösen.');
    engine.disconnect();
  }));
  $('#sync-use-server').addEventListener('click', () => void run(async () => {
    if (!backupOffered) throw new Error('Bitte zuerst ein Master-Backup herunterladen. Es bewahrt auch ausstehende lokale Änderungen.');
    await engine.acceptRemote();
  }));
  $('#sync-disconnect-backed-up').addEventListener('click', () => void run(async () => {
    if (!backupOffered) throw new Error('Bitte zuerst ein Backup herunterladen und sicher aufbewahren.');
    engine.disconnect({ allowPending: true });
  }));
  $('#sync-copy-link').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($('#sync-link').value); $('#sync-copy-status').textContent = 'Geräte-Link kopiert.'; }
    catch { $('#sync-link').focus(); $('#sync-link').select(); $('#sync-copy-status').textContent = 'Bitte den markierten Geräte-Link manuell kopieren.'; }
  });
  $('#sync-link').addEventListener('click', event => event.target.select());
  $('#sync-backup').addEventListener('click', () => void run(async () => {
    const c = engine?.connection;
    let remoteHistory = null;
    let remoteError = null;
    if (c?.role === 'master') {
      try { remoteHistory = await engine.history(); }
      catch (cause) { remoteError = cause.message; }
    }
    let value = null;
    try { value = snapshot(getSnapshot()); } catch { /* Demo or expired profile: retain raw storage below. */ }
    const storageErrors = [];
    const safeRead = key => { try { return storage.getItem(key); } catch { storageErrors.push(key); return null; } };
    const backup = { format: 'bauchgefuehl-backup', version: 1, createdAt: new Date().toISOString(), snapshot: value, connection: c, rawLocal: safeRead('bauchgefuehl.v1'), rawHistory: safeRead(HISTORY_KEY), rawSync: safeRead(SYNC_KEY), storageErrors, remoteHistory, remoteError };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bauchgefuehl-${c?.role || 'lokal'}-backup-${todayISO()}.json`;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    backupOffered = true;
    backupSignature = signature();
    $('#sync-disconnect-backed-up').hidden = false;
    notify(storageErrors.length ? 'Sitzungsdaten als Backup heruntergeladen. Der Browser-Speicher war nicht lesbar; gespeicherte Altstände können fehlen.' : remoteError ? 'Lokales Backup heruntergeladen. Der Serververlauf war nicht erreichbar und fehlt in dieser Datei.' : 'Backup-Download gestartet. Master-Dateien enthalten geheime Schlüssel; bitte sicher aufbewahren.');
  }));
  $('#sync-backup-file').addEventListener('change', async event => {
    await run(async () => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (file.size > 64 * 1024 * 1024) throw new Error('Diese Backup-Datei ist zu groß (maximal 64 MiB).');
      const data = JSON.parse(await file.text());
      if (data?.format !== 'bauchgefuehl-backup' || data.version !== 1) throw new Error('Das ist keine unterstützte Backup-Datei.');
      recovery = { snapshot: snapshot(data.snapshot), connection: data.connection ? validateConnection(data.connection) : null };
      $('#sync-recovery-description').textContent = recovery.connection ? `Diese Sicherung stellt ein ${recovery.connection.role === 'master' ? 'Mastergerät' : 'mitlesendes Gerät'} mit dem Dienst ${new URL(recovery.connection.endpoint).hostname} wieder her. Vorhandene lokale Daten werden zuvor gesichert. Verwende nur einen Master; ein älterer Stand überschreibt den Server nicht automatisch.` : 'Diese Sicherung stellt einen lokalen Datenstand wieder her. Vorhandene lokale Daten werden zuvor gesichert.';
    });
    event.target.value = '';
  });
  $('#sync-restore').addEventListener('click', () => void run(async () => {
    if (loadProblem && !backupOffered) throw new Error('Bitte zuerst den vorhandenen Stand als Backup herunterladen.');
    if (!recovery || engine.connection) throw new Error('Bitte zuerst eine bestehende Geräteverbindung trennen.');
    await applySnapshot(recovery.snapshot, { replaceJournal: true });
    if (recovery.connection) { engine.connection = recovery.connection; engine.persist(); }
    loadProblem = false;
    recovery = null;
    status = 'Backup lokal wiederhergestellt. Der Sync prüft den Serverstand; Konflikte werden nicht überschrieben.';
    void engine.tick();
  }));
  $('#sync-cancel-restore').addEventListener('click', () => { recovery = null; update(); });
  function readInvitation() {
    if (!location.hash.startsWith('#sync=')) return;
    try {
      candidate = parseInvitation(location.hash);
      $('#sync-candidate-description').textContent = `Dieses Gerät erhält Leserechte für den Masterstand über ${new URL(candidate.endpoint).hostname}. Dabei wird der verschlüsselte Stand vom Dienst abgerufen. Vorhandene lokale Angaben werden vor der Übernahme gesichert. Es werden keine lokalen Daten in den Raum hochgeladen.`;
      open();
    } catch (cause) { notify(`Geräte-Link ungültig: ${cause.message}`); }
  }
  window.addEventListener('hashchange', readInvitation);
  function tick() {
    update();
    if (engine && (engine.connection?.role !== 'master' || leaseHeld)) void engine.tick();
  }
  window.addEventListener('online', tick);
  window.addEventListener('storage', event => {
    if (event.key !== SYNC_KEY || !engine || engine.busy) return;
    try { engine.connection = event.newValue ? validateConnection(JSON.parse(event.newValue)) : null; update(); }
    catch { error('Die Geräteverbindung wurde in einem anderen Tab ungültig verändert. Bitte zuerst ein Backup herunterladen.'); }
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
  window.addEventListener('pagehide', () => { releaseLease?.(); releaseLease = null; leaseRoom = null; leaseHeld = false; });
  window.addEventListener('pageshow', tick);
  setInterval(() => { if (!document.hidden) tick(); }, 5000);
  // Delay initial work until the caller has finished setting up its state.
  queueMicrotask(() => { update(); readInvitation(); if (!candidate) tick(); });
  return {
    get connection() { return engine?.connection; },
    get readOnly() { return readOnly(); },
    queue(value) { if (readOnly()) throw new Error('Änderungen sind nur im aktiven Master-Tab möglich.'); if (engine) engine.queue(value); },
    open,
  };
}
