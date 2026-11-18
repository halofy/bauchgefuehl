import { collectBackup, encryptBackup, decryptBackup, restoreFullBackup, validateFullBackup, BACKUP_KEYS } from './backup.js';
import { COMPANION_KEY, COMPANION_HISTORY_KEY, readCompanion, normalizeCompanion } from './companion.js';
import { STORAGE_KEY, HISTORY_KEY, readLocal, todayISO } from './pregnancy.js';
import { SYNC_KEY, snapshot } from './sync.js';
import { BIRTH_KEY, BIRTH_HISTORY_KEY, readBirth, normalizeBirth } from './birth.js';
import { DEVICE_KEY, RECOVERY_KEY, MAX_TRANSFER_QR_LENGTH, createIdentity, normalizeDevice, sealTransfer, openTransfer, transferLink, parseTransferInput, checkIncoming, importSnapshot, commitBundle } from './device-transfer.js';
import { createQrSvg } from './qr.js';
import { CARE_KEY, CARE_HISTORY_KEY, readCare, normalizeCare } from './care.js';

export function setupDevices({ storage, getSnapshot, applySnapshot, notify, onConnection, reloadExtras }) {
  const $ = id => document.getElementById(id);
  let pendingFullBackup = null;
  let envelope = null; let packet = null; let backup = null; let generated = null; let working = false; let backupSignature = '';
  let generatedFile = null; let sharing = false;
  let storageAvailable = true;
  function signature() { return JSON.stringify([...BACKUP_KEYS,RECOVERY_KEY].map(key => storage.getItem(key))); }
  let leaseSource = null; let leaseHeld = false; let releaseLease = null;
  function config() {
    let recovery; let raw;
    try { recovery = storage.getItem(RECOVERY_KEY); raw = storage.getItem(DEVICE_KEY); storageAvailable = true; }
    catch { storageAvailable = false; throw new Error('Der Browser-Speicher ist nicht verfügbar. Geräte-Stände benötigen zuverlässigen lokalen Speicher.'); }
    if (recovery) throw new Error('Eine Import-Sicherung ist noch offen. Bitte zuerst ein vollständiges Backup herunterladen und die App erneut öffnen.');
    return normalizeDevice(raw ? JSON.parse(raw) : null);
  }
  function ensureLease(device) {
    if (device?.role !== 'master') { releaseLease?.(); releaseLease = null; leaseSource = null; leaseHeld = false; return; }
    if (leaseSource === device.source) return;
    releaseLease?.(); leaseSource = device.source; leaseHeld = false;
    if (!navigator.locks?.request) return;
    const source = device.source;
    void navigator.locks.request(`bauchgefuehl-master:${source}`, { ifAvailable: true }, async lock => {
      if (!lock) { leaseSource = null; return; }
      if (config()?.source !== source) return;
      leaseHeld = true; update(false);
      await new Promise(resolve => { releaseLease = resolve; });
    }).catch(() => { leaseHeld = false; });
  }
  function error(message) { $('device-error').textContent = message; $('device-error').hidden = !message; }
  function download(value, name) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(value)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function update(acquire = true) {
    let device = null; let problem = '';
    try { device = config(); } catch (cause) { problem = cause.message; error(problem); }
    if (acquire && !problem) ensureLease(device);
    $('sync-role').textContent = problem ? 'Datenstand prüfen' : device?.role === 'master' ? 'Master · ohne Server' : device?.role === 'follower' ? 'Mitlesestand · ohne Server' : 'Daten & Backup';
    $('sync-status').textContent = problem || (device?.role === 'follower' ? `Version ${device.revision} · Aktualisierung bewusst per Datei oder QR/Link übernehmen.` : 'Alles lokal. Verschlüsselten Stand bei Bedarf auf das zweite Gerät übertragen.');
    $('device-status').textContent = device ? `${device.role === 'master' ? 'Master' : 'Mitlesegerät'} · Version ${device.revision} · Kennung ${device.source.slice(0, 16)}` : 'Noch keinem Master zugeordnet. Eigene Daten bleiben lokal bearbeitbar.';
    try { $('device-legacy').hidden = !storage.getItem(SYNC_KEY); } catch { $('device-legacy').hidden = true; }
    $('device-generate').disabled = working || !!problem || device?.role === 'follower' || (device?.role === 'master' && (!leaseHeld || leaseSource !== device.source));
    $('device-promote').hidden = device?.role !== 'follower';
    $('device-apply').disabled = working || !packet;
    $('device-restore').disabled = working || !backup;
    $('device-download').disabled = working || !generated;
    for (const id of ['device-share-link', 'device-share-file']) $(id).disabled = working || sharing || !generated;
    if (device?.role === 'master' && !leaseHeld) $('device-status').textContent += ' · Dieser Tab wartet auf die Master-Sperre; andere Master-Tabs schließen.';
    $('device-release').hidden = !device;
    onConnection(device, Boolean((problem && storageAvailable) || device?.role === 'follower' || (device?.role === 'master' && !leaseHeld)));
  }
  async function run(action) {
    if (working) return;
    working = true; error(''); update();
    try {
      if (!navigator.locks?.request) throw new Error('Bitte einen aktuellen Browser mit sicheren lokalen Gerätesperren verwenden.');
      await navigator.locks.request('bauchgefuehl-local-write', action);
    } catch (cause) { error(cause.message); }
    finally { working = false; update(); }
  }
  function open() {
    for (const id of ['share-dialog', 'birth-dialog']) if ($(id).open) $(id).close();
    generated = null; $('device-output').hidden = true;
    update(); $('sync-dialog').showModal();
  }
  $('open-sync').addEventListener('click', open);
  $('device-backup').addEventListener('click', () => void run(async () => {
    const password = $('backup-password').value;
    if (password !== $('backup-password-confirm').value) throw new Error('Die beiden Sicherungspasswörter stimmen nicht überein.');
    let memorySnapshot=null;try{memorySnapshot=snapshot(getSnapshot());}catch{/* Raw data remain exportable without a usable current profile. */}
    const before = signature(), full = collectBackup(storage,memorySnapshot);
    const encrypted = await encryptBackup(full,password);
    const checked = await decryptBackup(encrypted,password);
    if (JSON.stringify(checked) !== JSON.stringify(full) || signature() !== before) throw new Error('Während der Sicherung wurden Daten geändert. Bitte erneut sichern.');
    download(encrypted, `bauchgefuehl-vollsicherung-${todayISO()}.json`);
    backupSignature = before;
    $('backup-status').textContent = `Vollsicherung am ${new Date().toLocaleString('de-DE')} verschlüsselt und intern entschlüsselt geprüft. Download gestartet${full.recovery?' · enthält Rohdaten eines unterbrochenen Imports':''}; bitte Datei und Passwort getrennt sicher aufbewahren. Die App kann den Speicherort nicht prüfen.`;
    $('backup-password').value = ''; $('backup-password-confirm').value = '';
    notify('Verschlüsselte Vollsicherung geprüft; Download gestartet.');
  }));
  $('device-generate').addEventListener('click', () => void run(async () => {
    const value = getSnapshot();
    let device = config(); if (!device) device = await createIdentity();
    else if (device.role === 'master' && (!leaseHeld || leaseSource !== device.source)) throw new Error('Dieser Master ist in einem anderen Tab aktiv. Bitte dort den Stand erstellen.');
    const result = await sealTransfer(value, device, $('device-password').value, { care: readCare(storage), companion: readCompanion(storage), contacts: $('device-include-contacts').checked ? readBirth(storage).contacts : null });
    storage.setItem(DEVICE_KEY, JSON.stringify(result.device)); generated = result.envelope;
    generatedFile = new File([JSON.stringify(generated)], `bauchgefuehl-stand-${todayISO()}.json`, { type: 'application/json' });
    const link = transferLink(generated, location.href);
    const qrLink = link && link.length <= MAX_TRANSFER_QR_LENGTH ? link : null;
    $('device-output').hidden = false; $('device-link').value = link || '';
    $('device-link-controls').hidden = !link; $('device-qr').replaceChildren(); $('device-qr').hidden = !qrLink;
    if (qrLink) { try { $('device-qr').innerHTML = createQrSvg(qrLink); } catch { $('device-qr').textContent = 'QR-Code nicht verfügbar. Link oder Datei verwenden.'; } }
    $('device-size-note').textContent = qrLink ? `Der vollständige verschlüsselte Stand passt in QR und Link (${link.length.toLocaleString('de-DE')} Zeichen). Passwort auf dem zweiten Gerät separat eingeben.` : link ? `Der vollständige Stand ist als langer Link verfügbar (${link.length.toLocaleString('de-DE')} Zeichen), aber zu groß für einen einzelnen QR-Code. Manche Teilen-Ziele kürzen lange Links; dann die verschlüsselte Datei verwenden. Es wird nichts weggelassen.` : 'Dieser vollständige Stand überschreitet auch die Linkgrenze von 64 KiB. Bitte die verschlüsselte Datei weitergeben. Es wird nichts gekürzt.';
    $('device-share-link').hidden = !link || typeof navigator.share !== 'function';
    let canShareFile = false;
    try { canShareFile = typeof navigator.share === 'function' && navigator.canShare?.({ files: [generatedFile] }) === true; } catch { /* Download remains available. */ }
    $('device-share-file').hidden = !canShareFile;
    $('device-local-warning').hidden = !link || !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  }));
  $('device-download').addEventListener('click', () => { if (generated) download(generated, `bauchgefuehl-stand-${todayISO()}.json`); });
  async function nativeShare(data) {
    if (!generated || sharing || working) return;
    sharing = true; error(''); update();
    try {
      await navigator.share(data);
      notify('An das gewählte Teilen-Ziel übergeben. Das bestätigt noch keine Übernahme auf dem zweiten Gerät. Passwort separat eingeben.');
    } catch (cause) {
      if (cause.name !== 'AbortError') error('Teilen hier nicht möglich. Bitte Link kopieren oder die verschlüsselte Datei herunterladen.');
    } finally { sharing = false; update(); }
  }
  $('device-share-link').addEventListener('click', () => { if ($('device-link').value) void nativeShare({ title: 'Verschlüsselter bauchgefühl-Stand', url: $('device-link').value }); });
  $('device-share-file').addEventListener('click', () => { if (generatedFile) void nativeShare({ title: 'Verschlüsselter bauchgefühl-Stand', files: [generatedFile] }); });
  $('device-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($('device-link').value); notify('Verschlüsselter Stand-Link kopiert. Passwort separat weitergeben.'); }
    catch { $('device-link').focus(); $('device-link').select(); }
  });
  $('device-open').addEventListener('click', () => void run(async () => {
    packet = null; $('device-candidate').hidden = true;
    envelope = parseTransferInput($('device-input').value);
    packet = await openTransfer(envelope, $('device-receive-password').value);
    const data = packet.data.snapshot;
    $('device-preview').textContent = `Master ${packet.source.slice(0, 16)} · Version ${packet.revision} · ${data.journal.length} Journaleinträge einschließlich Archiv · ${Object.keys(data.checks).length} Merkhäkchen · ${packet.data.care?.appointments.length ?? 0} Termine · ${packet.data.care?.notes.length ?? 0} Terminnotizen · ${packet.data.companion?.plans.length ?? 0} Planungseinträge · ${packet.data.companion?.growth.length ?? 0} Untersuchungswerte${packet.data.contacts ? ` · ${packet.data.contacts.length} Kontakte optional enthalten` : ''}. Die Berechnungsgrundlage wird ebenfalls übernommen. Noch wurde nichts geändert.`;
    $('device-candidate').hidden = false; $('device-take-contacts').checked = false; $('device-take-contacts-label').hidden = !packet.data.contacts;
  }));
  $('device-file').addEventListener('change', async event => {
    try {
      const file = event.target.files?.[0]; if (!file) return;
      if (file.size > 1200000) throw new Error('Die verschlüsselte Datei ist zu groß.');
      $('device-input').value = await file.text(); packet = null; $('device-candidate').hidden = true; update();
    } catch (cause) { error(cause.message); }
    event.target.value = '';
  });
  $('device-input').addEventListener('input', () => { packet = null; $('device-candidate').hidden = true; update(); });
  $('device-receive-password').addEventListener('input', () => { packet = null; $('device-candidate').hidden = true; update(); });
  $('sync-dialog').addEventListener('close', () => { $('device-password').value = ''; $('device-receive-password').value = ''; packet = null; $('device-candidate').hidden = true; $('backup-password').value=''; $('backup-password-confirm').value=''; $('backup-restore-password').value=''; pendingFullBackup=null; backup=null; $('backup-unlock-box').hidden=true; $('device-restore-box').hidden=true; });
  $('device-apply').addEventListener('click', () => void run(async () => {
    if (!packet) throw new Error('Bitte zuerst entschlüsseln und die Vorschau prüfen.');
    const birth = readBirth(storage);
    if (birth.active) throw new Error('Bitte zuerst die offene Wehenmessung abschließen.');
    const current = { ...readLocal(storage), care: readCare(storage), companion: readCompanion(storage) }; const device = config();
    const replace = !device && backupSignature === signature();
    const next = checkIncoming(packet, device, current, { replace });
    if (current.profile && !device && JSON.stringify(current.profile) !== JSON.stringify(packet.data.snapshot.profile) && !replace) throw new Error('Die Datierung unterscheidet sich. Bitte zuerst den vorhandenen Stand mit „Vollständiges Backup“ sichern.');
    const value = importSnapshot(storage, packet.data.snapshot, { device: next, care: packet.data.care ?? normalizeCare(), companion: packet.data.companion ?? normalizeCompanion(), ...(packet.data.contacts && $('device-take-contacts').checked ? { birth: { ...birth, contacts: packet.data.contacts } } : {}), replaceJournal: replace });
    applySnapshot(value, { alreadyStored: true }); reloadExtras(); packet = null; $('device-candidate').hidden = true;
    try { if (location.hash.startsWith('#transfer=')) history.replaceState(null, '', location.pathname + location.search); } catch { /* No data is sent in fragments. */ }
    notify('Stand übernommen. Dieses Gerät liest mit; Änderungen erfolgen am Master.');
  }));
  $('device-backup-file').addEventListener('change', async event => {
    try {
      const file = event.target.files?.[0]; if (!file) return;
      if (file.size > 64 * 1024 * 1024) throw new Error('Die Backup-Datei ist zu groß (maximal 64 MiB).');
      const parsed = JSON.parse(await file.text());
      pendingFullBackup = null; backup = null;
      if (parsed.format === 'bauchgefuehl-encrypted-backup') {
        pendingFullBackup = parsed;
        $('backup-unlock-box').hidden = false; $('device-restore-box').hidden = true;
        $('backup-unlock-status').textContent = 'Verschlüsselte Vollsicherung ausgewählt. Passwort eingeben und Vorschau öffnen. Noch wurde nichts geändert.';
        update(); return;
      }
      if (parsed.format === 'bauchgefuehl-offline-backup' && parsed.v === 1) {
        const raw = parsed.raw; const local = JSON.parse(raw?.[STORAGE_KEY] || 'null');
        const data = local ? { ...local, schema: 3 } : parsed.memorySnapshot;
        if (!data && !raw?.[BIRTH_KEY] && !raw?.[CARE_KEY]) throw new Error('Die Sicherung enthält keine wiederherstellbaren Angaben.');
        backup = { snapshot: data ? snapshot(data) : null, device: raw?.[DEVICE_KEY] ? normalizeDevice(JSON.parse(raw[DEVICE_KEY])) : null, care: raw?.[CARE_KEY] ? normalizeCare(JSON.parse(raw[CARE_KEY])) : data ? normalizeCare() : undefined, birth: raw?.[BIRTH_KEY] ? normalizeBirth(JSON.parse(raw[BIRTH_KEY])) : data ? normalizeBirth() : undefined, legacySync: raw?.[SYNC_KEY] ?? null, birthHistory: raw?.[BIRTH_HISTORY_KEY] ?? '[]' };
        if (!data && backup.device) throw new Error('Die Gerätezuordnung benötigt eine gültige Schwangerschaftsgrundlage. Die Rohdaten bleiben in der Sicherungsdatei.');
      } else if (parsed.format === 'bauchgefuehl-backup' && parsed.version === 1) {
        backup = { snapshot: snapshot(parsed.snapshot), device: null, care: normalizeCare(), birth: normalizeBirth(), legacySync: parsed.rawSync || (parsed.connection ? JSON.stringify(parsed.connection) : null) };
      } else throw new Error('Keine unterstützte Backup-Datei.');
      $('device-backup-preview').textContent = `Enthalten: ${backup.care?.appointments.length ?? 0} Termine, ${backup.care?.notes.length ?? 0} Terminnotizen. ${backup.snapshot ? 'Der vollständige aktive Stand wird ersetzt; ältere Backups ohne Termine leeren diesen Bereich nach Sicherung.' : 'Nur enthaltene Zusatzbereiche werden wiederhergestellt; vorhandene Schwangerschaftsangaben bleiben erhalten.'}`;
      $('device-restore-box').hidden = false; update();
    } catch (cause) { backup = null; error(cause.message); update(); }
    event.target.value = '';
  });
  $('backup-unlock').addEventListener('click', () => void run(async () => {
    if (!pendingFullBackup) throw new Error('Bitte zuerst eine verschlüsselte Vollsicherung auswählen.');
    const full = validateFullBackup(await decryptBackup(pendingFullBackup,$('backup-restore-password').value));
    backup = { full };$('backup-use-memory').checked=false;
    const differentSession=full.memorySnapshot && (!full.raw[STORAGE_KEY] || JSON.stringify(snapshot(full.memorySnapshot))!==JSON.stringify(snapshot(JSON.parse(full.raw[STORAGE_KEY]))));
    $('backup-use-memory-label').hidden=!differentSession;
    const raw=full.raw, care=raw[CARE_KEY]?normalizeCare(JSON.parse(raw[CARE_KEY])):normalizeCare();
    const companion=raw[COMPANION_KEY]?normalizeCompanion(JSON.parse(raw[COMPANION_KEY])):normalizeCompanion();
    const journal=raw[STORAGE_KEY]?JSON.parse(raw[STORAGE_KEY]).journal||[]:[];
    $('device-backup-preview').textContent = `Vollsicherung vom ${full.createdAt}: ${journal.length} Journaleinträge, ${care.appointments.length} Termine, ${care.notes.length} Terminnotizen, ${companion.plans.length} Planungseinträge, ${companion.growth.length} Untersuchungswerte${companion.birthDate?' · Geburt am '+companion.birthDate:''}. Gerätezuordnung: ${raw[DEVICE_KEY]?JSON.parse(raw[DEVICE_KEY]).role==='master'?'Master (der bisherige Master wird nicht deaktiviert)':'Mitlesegerät':'keine'}. Enthält auch Archive, Sicherungsverläufe, Kontakte, offene Wehenmessung und gegebenenfalls Master-Schlüssel. Ersetzt alle aufgeführten lokalen Bereiche einschließlich Gerätezuordnung. Noch wurde nichts geändert.`;
    $('device-restore-box').hidden=false;
    $('backup-unlock-status').textContent='Erfolgreich entschlüsselt und geprüft. Vorschau unten kontrollieren.';
    $('backup-restore-password').value='';
  }));
  $('device-restore').addEventListener('click', () => void run(() => {
    if (!backup) throw new Error('Bitte eine gültige Sicherung auswählen.');
    const device = config();
    if (device?.role === 'master' && (!leaseHeld || leaseSource !== device.source)) throw new Error('Wiederherstellung bitte im aktiven Master-Tab durchführen.');
    if (BACKUP_KEYS.some(key=>storage.getItem(key)!==null) && backupSignature !== signature()) throw new Error('Bitte zuerst den aktuellen Stand als vollständiges Backup herunterladen.');
    if (backup.full) { restoreFullBackup(storage,backup.full,{useMemory:$('backup-use-memory').checked}); location.reload(); return; }
    const value = importSnapshot(storage, backup.snapshot, { ...(backup.snapshot ? { device: backup.device, legacySync: backup.legacySync } : {}), care: backup.care, birth: backup.birth, birthHistory: backup.birthHistory, replaceJournal: true });
    if (value) applySnapshot(value, { alreadyStored: true });
    reloadExtras(); backup = null; $('device-restore-box').hidden = true;
    notify(value ? 'Sicherung lokal wiederhergestellt. Es wird kein Server kontaktiert.' : 'Enthaltene Zusatzbereiche wiederhergestellt. Vorhandene Schwangerschaftsangaben und Gerätezuordnung bleiben erhalten.');
  }));
  $('device-promote').addEventListener('click', () => void run(async () => {
    if (backupSignature !== signature()) throw new Error('Bitte zuerst diesen Mitlesestand als vollständiges Backup herunterladen.');
    const identity = await createIdentity(); storage.setItem(DEVICE_KEY, JSON.stringify(identity));
    notify('Dieses Gerät ist jetzt ein neuer Master. Der bisherige Master wird dadurch nicht deaktiviert; künftige Stände müssen bewusst neu zugeordnet werden.');
  }));
  $('device-release').addEventListener('click', () => void run(() => {
    const device = config();
    if (device?.role === 'master' && (!leaseHeld || leaseSource !== device.source)) throw new Error('Die Zuordnung bitte im aktiven Master-Tab lösen.');
    if (backupSignature !== signature()) throw new Error('Bitte zuerst den aktuellen Stand als vollständiges Backup herunterladen.');
    if (readBirth(storage).active) throw new Error('Bitte zuerst die offene Messung abschließen.');
    const history = JSON.parse(storage.getItem(HISTORY_KEY) || '[]');
    if (!Array.isArray(history)) throw new Error('Der Sicherungsverlauf muss zuerst geprüft werden.');
    const archived = [{ savedAt: new Date().toISOString(), raw: storage.getItem(STORAGE_KEY), device: storage.getItem(DEVICE_KEY) }, ...history].slice(0, 20);
    commitBundle(storage, { [HISTORY_KEY]: JSON.stringify(archived), [DEVICE_KEY]: null });
    notify('Zuordnung lokal gelöst. Deine Daten bleiben erhalten. Der vorherige Master und bereits übertragene Kopien werden dadurch nicht gelöscht.');
  }));
  function readHash() {
    if (location.hash.startsWith('#transfer=')) { $('device-input').value = location.href; packet = null; $('device-candidate').hidden = true; open(); }
    else if (location.hash.startsWith('#sync=')) { error('Dieser alte Geräte-Link benötigt einen Server und wird nicht mehr ausgeführt. Bitte einen neuen verschlüsselten Stand vom Master anfordern.'); open(); }
  }
  window.addEventListener('hashchange', readHash);
  window.addEventListener('storage', event => { if (event.key === DEVICE_KEY || event.key === null) update(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
  window.addEventListener('pagehide', () => { releaseLease?.(); leaseSource = null; leaseHeld = false; });
  queueMicrotask(() => { update(); readHash(); });
  return {
    get connection() { try { return config(); } catch { return { role: 'follower' }; } },
    get readOnly() { try { const device = config(); return device?.role === 'follower' || (device?.role === 'master' && (!leaseHeld || leaseSource !== device.source)); } catch { return storageAvailable; } },
    queue() { if (this.readOnly) throw new Error('Bitte Angaben am aktiven Master ändern.'); generated = null; $('device-output').hidden = true; update(); }, open,
  };
}
