import { snapshot } from './sync.js';
import { normalizeBirth, writeBirth } from './birth.js';
import { STORAGE_KEY, HISTORY_KEY, writeLocal } from './pregnancy.js';

export const DEVICE_KEY = 'bauchgefuehl.devices.v1';
export const RECOVERY_KEY = 'bauchgefuehl.import-recovery.v1';
const BUNDLE_KEYS = [STORAGE_KEY, HISTORY_KEY, 'bauchgefuehl.birth.v1', 'bauchgefuehl.birth-history.v1', DEVICE_KEY, 'bauchgefuehl.sync.v1'];
export const b64 = bytes => {
  let text = ''; for (let offset = 0; offset < bytes.length; offset += 16384) text += String.fromCharCode(...bytes.subarray(offset, offset + 16384));
  return btoa(text).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
};
const un64 = (text, max = 900000) => {
  if (typeof text !== 'string' || text.length > max || !/^[A-Za-z0-9_-]+$/.test(text)) throw new Error('Ungültige oder zu große Übertragungsdaten.');
  return Uint8Array.from(atob(text.replaceAll('-', '+').replaceAll('_', '/')), character => character.charCodeAt(0));
};
const bytes = text => new TextEncoder().encode(text);
const text = value => new TextDecoder('utf-8', { fatal: true }).decode(value);
export const digest = async value => b64(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes(value))));
function publicKey(key) {
  if (key?.kty !== 'EC' || key.crv !== 'P-256' || !/^[A-Za-z0-9_-]{43}$/.test(key.x) || !/^[A-Za-z0-9_-]{43}$/.test(key.y)) throw new Error('Ungültiger Geräteschlüssel.');
  return { kty: 'EC', crv: 'P-256', x: key.x, y: key.y, ext: true };
}
export async function createIdentity() {
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const pub = publicKey(await crypto.subtle.exportKey('jwk', pair.publicKey));
  return { role: 'master', source: await digest(JSON.stringify(pub)), publicKey: pub, privateKey: await crypto.subtle.exportKey('jwk', pair.privateKey), revision: 0, lastDigest: '' };
}
export function normalizeDevice(value) {
  if (!value) return null;
  if (!['master', 'follower'].includes(value.role) || !/^[A-Za-z0-9_-]{43}$/.test(value.source) || !Number.isSafeInteger(value.revision) || value.revision < 0) throw new Error('Der lokale Geräte-Stand ist beschädigt. Bitte eine Sicherung erstellen.');
  const result = { role: value.role, source: value.source, revision: value.revision, lastDigest: value.lastDigest || '' };
  if (value.role === 'master') {
    result.publicKey = publicKey(value.publicKey);
    if (typeof value.privateKey?.d !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(value.privateKey.d)) throw new Error('Master-Signaturschlüssel fehlt.');
    result.privateKey = { ...publicKey(value.privateKey), d: value.privateKey.d };
  }
  return result;
}
async function passwordKey(password, salt) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 256) throw new Error('Bitte ein gemeinsames Passwort mit mindestens 12 Zeichen verwenden.');
  const material = await crypto.subtle.importKey('raw', bytes(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 250000 }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function readBounded(stream, max) {
  const reader = stream.getReader(); const chunks = []; let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      length += value.length;
      if (length > max) throw new Error('Der entpackte Datenstand ist zu groß.');
      chunks.push(value);
    }
  } finally { await reader.cancel().catch(() => {}); }
  const result = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return result;
}
export async function sealTransfer(value, identity, password, { contacts = null, today } = {}) {
  const device = normalizeDevice(identity);
  if (device?.role !== 'master') throw new Error('Nur das Mastergerät kann einen Stand für Mitleser signieren.');
  const data = { snapshot: snapshot(value, today), ...(contacts === null ? {} : { contacts: normalizeBirth({ contacts }).contacts }) };
  const currentDigest = await digest(JSON.stringify(data));
  const revision = currentDigest === device.lastDigest ? device.revision : device.revision + 1;
  const body = JSON.stringify({ v: 1, source: device.source, revision, data });
  const key = await crypto.subtle.importKey('jwk', device.privateKey, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const signature = b64(new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, bytes(body))));
  let plain = bytes(JSON.stringify({ body, publicKey: device.publicKey, signature }));
  if (plain.length > 650000) throw new Error('Dieser Datenstand ist für das Übertragungsformat zu groß. Bitte eine vollständige Sicherung verwenden; es wird nichts gekürzt.');
  let codec = 'json';
  if (typeof CompressionStream === 'function') {
    plain = await readBounded(new Blob([plain]).stream().pipeThrough(new CompressionStream('gzip')), 600000); codec = 'gzip';
  }
  const salt = crypto.getRandomValues(new Uint8Array(16)); const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: bytes(`bauchgefuehl-transfer-v1:${codec}`) }, await passwordKey(password, salt), plain);
  return { envelope: { format: 'bauchgefuehl-transfer', v: 1, codec, salt: b64(salt), iv: b64(iv), data: b64(new Uint8Array(cipher)) }, device: { ...device, revision, lastDigest: currentDigest } };
}
export async function openTransfer(envelope, password, today) {
  if (envelope?.format !== 'bauchgefuehl-transfer' || envelope.v !== 1 || !['gzip', 'json'].includes(envelope.codec)) throw new Error('Keine unterstützte verschlüsselte Übertragung.');
  const salt = un64(envelope.salt, 24); const iv = un64(envelope.iv, 18);
  if (salt.length !== 16 || iv.length !== 12) throw new Error('Ungültige Verschlüsselungsdaten.');
  let plain;
  try { plain = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv, additionalData: bytes(`bauchgefuehl-transfer-v1:${envelope.codec}`) }, await passwordKey(password, salt), un64(envelope.data))); }
  catch { throw new Error('Passwort falsch oder Übertragung beschädigt. Deine Daten wurden nicht geändert.'); }
  if (envelope.codec === 'gzip') {
    if (typeof DecompressionStream !== 'function') throw new Error('Dieser Browser unterstützt das Entpacken nicht. Bitte einen aktuellen Browser verwenden.');
    plain = await readBounded(new Blob([plain]).stream().pipeThrough(new DecompressionStream('gzip')), 650000);
  }
  if (plain.length > 650000) throw new Error('Der Datenstand ist zu groß.');
  const signed = JSON.parse(text(plain)); const pub = publicKey(signed.publicKey);
  const key = await crypto.subtle.importKey('jwk', pub, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
  if (typeof signed.body !== 'string' || !await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, un64(signed.signature, 100), bytes(signed.body))) throw new Error('Die Master-Signatur ist ungültig.');
  const body = JSON.parse(signed.body);
  if (body.v !== 1 || body.source !== await digest(JSON.stringify(pub)) || !Number.isSafeInteger(body.revision) || body.revision < 1) throw new Error('Ungültiger Master-Datenstand.');
  const data = { snapshot: snapshot(body.data?.snapshot, today), ...(body.data?.contacts === undefined ? {} : { contacts: normalizeBirth({ contacts: body.data.contacts }).contacts }) };
  return { source: body.source, revision: body.revision, data, digest: await digest(JSON.stringify(data)) };
}
// QR readability and URL transport are separate limits, not browser guarantees.
export const MAX_TRANSFER_QR_LENGTH = 2200;
export const MAX_TRANSFER_LINK_LENGTH = 65536;
export function transferLink(envelope, base, { maxLength = MAX_TRANSFER_LINK_LENGTH } = {}) {
  if (envelope?.format !== 'bauchgefuehl-transfer' || envelope.v !== 1 || !['gzip', 'json'].includes(envelope.codec) ||
      !/^[A-Za-z0-9_-]{22}$/.test(envelope.salt) || !/^[A-Za-z0-9_-]{16}$/.test(envelope.iv) ||
      typeof envelope.data !== 'string' || !/^[A-Za-z0-9_-]{22,900000}$/.test(envelope.data)) throw new Error('Ungültiger verschlüsselter Stand.');
  // Ciphertext is already base64url. Do not wrap it in another base64 JSON layer.
  const url = new URL(base); url.search = ''; url.hash = `transfer=2.${envelope.codec === 'gzip' ? 'g' : 'j'}.${envelope.salt}.${envelope.iv}.${envelope.data}`;
  if (url.href.length > maxLength) return null;
  return url.href;
}
export function parseTransferInput(value) {
  if (typeof value !== 'string' || value.length > 1200000) throw new Error('Die Übertragung ist zu groß.');
  const input = value.trim();
  if (input.startsWith('{')) return JSON.parse(input);
  const hash = input.startsWith('#') ? input : new URL(input).hash;
  if (!hash.startsWith('#transfer=')) throw new Error('Kein Geräte-Stand-Link.');
  const payload = hash.slice(10);
  if (payload.includes('.')) {
    const match = /^2\.([gj])\.([A-Za-z0-9_-]{22})\.([A-Za-z0-9_-]{16})\.([A-Za-z0-9_-]{22,900000})$/.exec(payload);
    if (!match) throw new Error('Unbekannter oder unvollständiger Geräte-Stand-Link.');
    return { format: 'bauchgefuehl-transfer', v: 1, codec: match[1] === 'g' ? 'gzip' : 'json', salt: match[2], iv: match[3], data: match[4] };
  }
  // Existing v1 JSON/base64 links remain readable.
  return JSON.parse(text(un64(payload, 1200000)));
}
export function checkIncoming(packet, device, current, { replace = false } = {}) {
  const config = normalizeDevice(device);
  if (config?.role === 'master') throw new Error('Ein Master übernimmt keinen fremden Stand. Sichere die Daten und löse den Master bei Bedarf bewusst ab.');
  if (config && config.source !== packet.source) throw new Error('Dieser Stand gehört zu einem anderen Master. Die bestehende Zuordnung bleibt erhalten.');
  if (config && packet.revision < config.revision) throw new Error('Dieser Stand ist älter als der bereits übernommene Stand.');
  if (config && packet.revision === config.revision && packet.digest !== config.lastDigest) throw new Error('Versionskonflikt: gleiche Version mit anderem Inhalt.');
  const localIds = new Set(current?.journal?.map(entry => entry.id) || []);
  const incomingIds = new Set(packet.data.snapshot.journal.map(entry => entry.id));
  if ([...localIds].some(id => !incomingIds.has(id)) && (!replace || config)) throw new Error('Dieser Import würde vorhandene Journaleinträge entfernen. Bitte den lokalen Stand zuerst sichern; es wird nichts still überschrieben.');
  if (config || !replace) for (const local of current?.journal || []) {
    const incoming = packet.data.snapshot.journal.find(entry => entry.id === local.id);
    if (incoming && (incoming.updatedAt < local.updatedAt || (incoming.updatedAt === local.updatedAt && JSON.stringify(incoming) !== JSON.stringify(local)))) throw new Error('Der eingehende Stand würde eine neuere oder abweichende Journalfassung überschreiben. Bitte die Sicherungen prüfen.');
  }
  return { role: 'follower', source: packet.source, revision: packet.revision, lastDigest: packet.digest };
}

// A durable recovery record precedes all multi-key changes. On restart, a partially written bundle is rolled back.
export function recoverBundle(storage) {
  const raw = storage.getItem(RECOVERY_KEY); if (!raw) return;
  const record = JSON.parse(raw);
  if (record?.v !== 1 || !record.before || !record.after) throw new Error('Die Import-Sicherung muss geprüft werden.');
  const keys = Object.keys(record.after);
  if (keys.some(key => !BUNDLE_KEYS.includes(key) || ![record.before[key], record.after[key]].every(value => value === null || typeof value === 'string'))) throw new Error('Ungültige Import-Sicherung.');
  const complete = keys.every(key => storage.getItem(key) === record.after[key]);
  if (!complete) for (const key of keys) {
    if (record.before[key] === null) storage.removeItem(key); else storage.setItem(key, record.before[key]);
  }
  storage.removeItem(RECOVERY_KEY);
}
export function importSnapshot(storage, value, { device, birth, legacySync, birthHistory, history, today, replaceJournal = false } = {}) {
  if (value === null && birth === undefined) throw new Error('Die Sicherung enthält keine wiederherstellbaren Angaben.');
  const checked = value === null ? null : snapshot(value, today);
  const after = {};
  const shadow = { getItem: key => Object.hasOwn(after, key) ? after[key] : storage.getItem(key), setItem: (key, data) => { after[key] = data; } };
  if (checked) writeLocal(shadow, checked.profile, checked.checks, today, checked.journal, { replaceJournal });
  if (device !== undefined) after[DEVICE_KEY] = device === null ? null : JSON.stringify(normalizeDevice(device));
  if (birth !== undefined) writeBirth(shadow, birth);
  if (legacySync !== undefined) after['bauchgefuehl.sync.v1'] = legacySync;
  if (birthHistory !== undefined) {
    if (typeof birthHistory !== 'string' || birthHistory.length > 200000 || !Array.isArray(JSON.parse(birthHistory))) throw new Error('Ungültiger Kontakt-Sicherungsverlauf.');
  }
  // Imported historical raw records remain in the backup file; never discard the device's own history.
  if (history !== undefined && !Array.isArray(JSON.parse(history || '[]'))) throw new Error('Ungültiger Sicherungsverlauf.');
  commitBundle(storage, after);
  return checked;
}
export function commitBundle(storage, after) {
  if (Object.entries(after).some(([key, value]) => !BUNDLE_KEYS.includes(key) || (value !== null && typeof value !== 'string'))) throw new Error('Ungültige Import-Zielfelder.');
  recoverBundle(storage);
  const before = Object.fromEntries(Object.keys(after).map(key => [key, storage.getItem(key)]));
  storage.setItem(RECOVERY_KEY, JSON.stringify({ v: 1, before, after }));
  try {
    for (const [key, value] of Object.entries(after)) { if (value === null) storage.removeItem(key); else storage.setItem(key, value); }
  } catch (cause) {
    try { recoverBundle(storage); } catch { throw new Error('Import unterbrochen. Die vollständige Import-Sicherung ist lokal erhalten; bitte Backup herunterladen und erneut öffnen.'); }
    throw cause;
  }
  // A failed cleanup is harmless: restart sees the complete after-image and finalizes it.
  try { storage.removeItem(RECOVERY_KEY); } catch { /* Preserve the recovery record. */ }
}
