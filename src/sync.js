import { validateProfile, todayISO } from './pregnancy.js';
import { normalizeJournal, assertJournalContinuity, MAX_SNAPSHOT_BYTES } from './journal.js';

export const SYNC_KEY = 'bauchgefuehl.sync.v1';
const TOKEN = /^[A-Za-z0-9_-]{43}$/;
const ID = /^[A-Za-z0-9_-]{32,64}$/;
const bytes64 = bytes => {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 32768) binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
};
const from64 = text => Uint8Array.from(atob(text.replaceAll('-', '+').replaceAll('_', '/')), c => c.charCodeAt(0));
export const randomToken = () => bytes64(crypto.getRandomValues(new Uint8Array(32)));
export const hashToken = async token => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)))].map(x => x.toString(16).padStart(2, '0')).join('');

export function endpointURL(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) throw new Error('Der Sync-Dienst muss HTTPS verwenden.');
  if (url.username || url.password || url.hash || url.search || url.pathname !== '/') throw new Error('Bitte nur die Basisadresse des Sync-Dienstes eingeben.');
  return url.origin;
}

export function snapshot(value, today = todayISO()) {
  const profile = validateProfile(value?.profile, today);
  const checks = {};
  const entries = Object.entries(value?.checks || {});
  if (entries.length > 64) throw new Error('Zu viele Merkhäkchen im Datenstand.');
  for (const [id, checked] of entries.sort(([a], [b]) => a.localeCompare(b))) {
    if (/^[a-z0-9-]{1,40}$/.test(id) && checked === true) checks[id] = true;
  }
  if (value?.schema !== undefined && value.schema !== 3) throw new Error('Dieser Datenstand benötigt eine neuere App-Version.');
  if (value?.schema === 3 && !Array.isArray(value.journal)) throw new Error('Im Datenstand fehlt das Journal.');
  const result = { schema: 3, profile, checks, journal: normalizeJournal(value?.journal, today) };
  if (new TextEncoder().encode(JSON.stringify(result)).length > MAX_SNAPSHOT_BYTES) throw new Error('Der Datenstand überschreitet 512 KiB. Vorhandene Einträge werden nicht gekürzt.');
  return result;
}

export function validateConnection(raw) {
  if (!raw || raw.v !== 1 || !['master', 'follower'].includes(raw.role) || !ID.test(raw.room) || !TOKEN.test(raw.readToken) || !TOKEN.test(raw.key) || !Number.isSafeInteger(raw.revision) || raw.revision < 1) throw new Error('Ungültige Geräteverbindung.');
  if (raw.role === 'master' && !TOKEN.test(raw.writeToken)) throw new Error('Master-Schlüssel fehlt.');
  const result = { v: 1, role: raw.role, endpoint: endpointURL(raw.endpoint), room: raw.room, key: raw.key, readToken: raw.readToken, revision: raw.revision };
  if (raw.published) result.published = snapshot(raw.published);
  if (raw.role === 'master') {
    result.writeToken = raw.writeToken;
    result.ready = raw.ready === true;
    result.conflict = raw.conflict === true;
    if (raw.pending) {
      if (!ID.test(raw.pending.id)) throw new Error('Ungültige ausstehende Änderung.');
      result.pending = { id: raw.pending.id, snapshot: snapshot(raw.pending.snapshot) };
    }
    if (raw.inflight) {
      if (!ID.test(raw.inflight.mutationId) || !Number.isSafeInteger(raw.inflight.baseRevision) || raw.inflight.baseRevision < 1 || !validEnvelope(raw.inflight.envelope)) throw new Error('Ungültige ausstehende Übertragung.');
      result.inflight = raw.inflight;
    }
  }
  else result.ready = true;
  return result;
}

function validEnvelope(e) {
  return ((e?.v === 1) || (e?.v === 2 && e.schema === 3)) && /^[A-Za-z0-9_-]{16}$/.test(e.iv) && typeof e.data === 'string' && /^[A-Za-z0-9_-]{22,720000}$/.test(e.data);
}
const aad = room => new TextEncoder().encode(`bauchgefuehl-sync-v1:${room}`);
const journalAad = room => new TextEncoder().encode(`bauchgefuehl-sync-v2:${room}:3`);
export async function encryptSnapshot(value, connection) {
  const data = new TextEncoder().encode(JSON.stringify(snapshot(value)));
  const key = await crypto.subtle.importKey('raw', from64(connection.key), 'AES-GCM', false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: journalAad(connection.room) }, key, data);
  return { v: 2, schema: 3, iv: bytes64(iv), data: bytes64(new Uint8Array(cipher)) };
}
export async function decryptSnapshot(envelope, connection) {
  if (!validEnvelope(envelope)) throw new Error('Ungültige verschlüsselte Daten.');
  const key = await crypto.subtle.importKey('raw', from64(connection.key), 'AES-GCM', false, ['decrypt']);
  const clear = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: from64(envelope.iv), additionalData: envelope.v === 1 ? aad(connection.room) : journalAad(connection.room) }, key, from64(envelope.data));
  const parsed = JSON.parse(new TextDecoder().decode(clear));
  if (envelope.v === 2 && parsed.schema !== 3) throw new Error('Der Datenstand hat ein unvollständiges Journalformat.');
  return snapshot(parsed);
}

export function invitation(connection, baseURL) {
  const config = validateConnection(connection);
  const url = new URL(baseURL);
  url.search = '';
  const payload = { v: 1, role: 'follower', endpoint: config.endpoint, room: config.room, key: config.key, readToken: config.readToken, revision: 1 };
  url.hash = `sync=${bytes64(new TextEncoder().encode(JSON.stringify(payload)))}`;
  return url.href;
}
export function parseInvitation(hash) {
  if (!hash.startsWith('#sync=')) return null;
  if (hash.length > 3000 || !/^[A-Za-z0-9_-]+$/.test(hash.slice(6))) throw new Error('Ungültiger Geräte-Link.');
  const raw = JSON.parse(new TextDecoder().decode(from64(hash.slice(6))));
  if (raw.role !== 'follower') throw new Error('Ein Geräte-Link darf keine Master-Rechte enthalten.');
  return validateConnection(raw);
}

export class SyncEngine {
  constructor({ storage, getSnapshot, applySnapshot, onStatus = () => {}, fetcher = (...args) => fetch(...args) }) {
    Object.assign(this, { storage, getSnapshot, applySnapshot, onStatus, fetcher });
    this.connection = null;
    this.busy = false;
    const raw = storage.getItem(SYNC_KEY);
    if (raw) this.connection = validateConnection(JSON.parse(raw));
  }
  persist() { this.storage.setItem(SYNC_KEY, JSON.stringify(this.connection)); }
  async request(connection, method, input, { cache = false, history = false, admin = null } = {}) {
    const headers = { Authorization: `Bearer ${admin || connection.writeToken || connection.readToken}` };
    if (input) headers['Content-Type'] = 'application/json';
    if (cache) headers['If-None-Match'] = `"${connection.revision}"`;
    const response = await this.fetcher(`${connection.endpoint}/rooms/${connection.room}${history ? '?history=1' : ''}`, { method, headers, body: input ? JSON.stringify(input) : undefined, cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(12000) });
    if (response.status === 304) return null;
    let result;
    try { result = await response.json(); } catch { throw new Error('Ungültige Antwort des Sync-Dienstes.'); }
    if (!response.ok) {
      const error = new Error(result.error || 'Sync-Dienst nicht erreichbar.');
      error.status = response.status;
      throw error;
    }
    return result;
  }
  async create(endpoint, admin) {
    if (this.connection) throw new Error('Bitte zuerst die bestehende Geräteverbindung trennen.');
    if (!admin) throw new Error('Der Einrichtungsschlüssel fehlt.');
    const connection = { v: 1, role: 'master', endpoint: endpointURL(endpoint), room: randomToken(), readToken: randomToken(), writeToken: randomToken(), key: randomToken(), revision: 1, ready: false };
    const initial = snapshot(this.getSnapshot());
    connection.published = initial;
    // Retain the complete recovery credentials BEFORE any network mutation.
    connection.inflight = { mutationId: randomToken(), baseRevision: 1, envelope: await encryptSnapshot(initial, connection) };
    this.connection = connection;
    this.persist();
    try {
      await this.request(connection, 'POST', { readHash: await hashToken(connection.readToken), writeHash: await hashToken(connection.writeToken), envelope: connection.inflight.envelope, mutationId: connection.inflight.mutationId }, { admin });
      // POST can be retried via PUT after an uncertain response: same mutation ID.
      delete connection.inflight;
      connection.ready = true;
      this.persist();
      this.onStatus('Master verbunden · Stand 1 gesichert.');
    } catch (error) {
      this.onStatus('Einrichtung nicht bestätigt. Master-Schlüssel sind lokal gesichert. Backup herunterladen und Einrichtung bei Bedarf mit einem neuen Raum wiederholen.');
      throw error;
    }
  }
  async join(config) {
    if (this.connection) throw new Error('Bitte zuerst die bestehende Geräteverbindung trennen.');
    const connection = validateConnection(config);
    if (connection.role !== 'follower') throw new Error('Nur eine mitlesende Verbindung kann per QR-Code übernommen werden.');
    const remote = await this.request(connection, 'GET');
    if (!Number.isSafeInteger(remote?.revision) || remote.revision < 1) throw new Error('Ungültiger Serverstand.');
    const value = await decryptSnapshot(remote.envelope, connection);
    // A recovery copy of the existing local profile is made by applySnapshot.
    await this.applySnapshot(value, { replaceJournal: true });
    connection.revision = remote.revision;
    connection.published = value;
    this.connection = connection;
    this.persist();
    this.onStatus(`Mitlesend verbunden · Stand ${connection.revision}.`);
  }
  queue(value) {
    if (!this.connection) return;
    if (this.connection.role !== 'master') throw new Error('Änderungen sind nur am Master möglich.');
    const next = snapshot(value);
    assertJournalContinuity(next.journal, this.connection.published?.journal || []);
    this.connection.pending = { id: randomToken(), snapshot: next };
    this.persist();
    this.onStatus('Änderung lokal gesichert · Übertragung ausstehend.');
    void this.tick();
  }
  async tick() {
    const c = this.connection;
    if (!c || this.busy) return;
    if (c.conflict) { this.onStatus('Versionskonflikt · automatische Übertragung angehalten. Lokale Daten und Serverstand bleiben erhalten. Backup herunterladen.'); return; }
    this.busy = true;
    try {
      if (c.role === 'master') {
        // Recover the small crash window between saving the profile and queuing it.
        if (!c.pending && !c.inflight && c.published) {
          const current = snapshot(this.getSnapshot());
          assertJournalContinuity(current.journal, c.published.journal);
          if (JSON.stringify(current) !== JSON.stringify(c.published)) {
            c.pending = { id: randomToken(), snapshot: current };
            this.persist();
          }
        }
        if (!c.inflight && c.pending) {
          const pending = c.pending;
          const envelope = await encryptSnapshot(pending.snapshot, c);
          c.inflight = { mutationId: pending.id, baseRevision: c.revision, envelope };
          this.persist();
        }
        if (c.inflight) {
          const sent = c.inflight;
          // A previously used old app may have discarded the journal from its
          // local cache and connection metadata. Check the actual authority too.
          const remote = await this.request(c, 'GET');
          if (remote.revision === sent.baseRevision) {
            const previous = await decryptSnapshot(remote.envelope, c);
            const next = await decryptSnapshot(sent.envelope, c);
            try { assertJournalContinuity(next.journal, previous.journal); }
            catch (error) { error.status = 409; throw error; }
          }
          const result = await this.request(c, 'PUT', sent);
          if (!Number.isSafeInteger(result?.revision) || result.revision < c.revision) throw new Error('Ungültige Serverbestätigung.');
          c.revision = result.revision;
          c.published = await decryptSnapshot(sent.envelope, c);
          c.ready = true;
          if (c.pending?.id === sent.mutationId) delete c.pending;
          delete c.inflight;
          this.persist();
        } else {
          const remote = await this.request(c, 'GET');
          if (remote.revision !== c.revision) {
            const error = new Error('Ein anderer Master hat den Serverstand verändert.');
            error.status = 409;
            throw error;
          }
        }
        this.onStatus(c.pending ? 'Weitere lokale Änderung wartet auf Übertragung.' : `Master verbunden · Stand ${c.revision} gesichert.`);
      } else {
        let cache = false;
        try { cache = JSON.stringify(snapshot(this.getSnapshot())) === JSON.stringify(c.published); } catch { /* Restore a missing local cache from the server. */ }
        const result = await this.request(c, 'GET', null, { cache });
        if (result) {
          if (!Number.isSafeInteger(result.revision) || result.revision < c.revision) throw new Error('Älterer Serverstand wurde nicht übernommen.');
          const value = await decryptSnapshot(result.envelope, c);
          await this.applySnapshot(value);
          c.revision = result.revision;
          c.published = value;
          this.persist();
        }
        this.onStatus(`Mitlesend verbunden · Stand ${c.revision}.`);
      }
    } catch (error) {
      if (error.status === 409 || error.status === 426) { c.conflict = true; this.persist(); }
      this.onStatus(error.status === 409 ? 'Versionskonflikt · nichts überschrieben. Backup herunterladen; Sync bleibt angehalten.' : `Sync ausstehend · ${error.message} Der letzte lokale Stand bleibt erhalten.`);
    } finally { this.busy = false; }
  }
  disconnect({ allowPending = false } = {}) {
    if (this.busy) throw new Error('Bitte die laufende Übertragung abwarten.');
    if (!allowPending && (this.connection?.pending || this.connection?.inflight)) throw new Error('Nicht bestätigte Änderungen zuerst als Backup sichern.');
    this.storage.removeItem(SYNC_KEY);
    this.connection = null;
    this.onStatus('Verbindung getrennt. Lokale Daten bleiben erhalten; geteilte Geräte-Links bleiben gültig.');
  }
  async history() {
    if (!this.connection) return null;
    return this.request(this.connection, 'GET', null, { history: true });
  }
  async acceptRemote() {
    const c = this.connection;
    if (!c || c.role !== 'master' || this.busy) throw new Error('Bitte die laufende Übertragung abwarten.');
    this.busy = true;
    try {
      const remote = await this.request(c, 'GET');
      if (!Number.isSafeInteger(remote.revision) || remote.revision < 1) throw new Error('Ungültiger Serverstand.');
      const value = await decryptSnapshot(remote.envelope, c);
      await this.applySnapshot(value, { replaceJournal: true });
      c.revision = remote.revision;
      c.published = value;
      c.ready = true;
      c.conflict = false;
      delete c.pending;
      delete c.inflight;
      this.persist();
      this.onStatus(`Serverstand ${c.revision} ausdrücklich übernommen. Vorherige lokale Angaben sind im Sicherungsverlauf.`);
    } finally { this.busy = false; }
  }
}
