import { STORAGE_KEY, HISTORY_KEY } from './pregnancy.js';
import { BIRTH_KEY, BIRTH_HISTORY_KEY, normalizeBirth } from './birth.js';
import { CARE_KEY, CARE_HISTORY_KEY, normalizeCare } from './care.js';
import { COMPANION_KEY, COMPANION_HISTORY_KEY, normalizeCompanion } from './companion.js';
import { DEVICE_KEY, RECOVERY_KEY, normalizeDevice, commitBundle, b64 } from './device-transfer.js';
import { SYNC_KEY, snapshot } from './sync.js';
export const BACKUP_KEYS = [STORAGE_KEY,HISTORY_KEY,BIRTH_KEY,BIRTH_HISTORY_KEY,CARE_KEY,CARE_HISTORY_KEY,COMPANION_KEY,COMPANION_HISTORY_KEY,DEVICE_KEY,SYNC_KEY];
const enc = new TextEncoder(), dec = new TextDecoder('utf-8', { fatal: true });
const LIMIT = 32 * 1024 * 1024;
function un64(s, max) { if (typeof s !== 'string' || s.length > max || !/^[a-zA-Z0-9_-]+$/.test(s)) throw new Error('Ungültige Sicherungsdatei.'); return Uint8Array.from(atob(s.replaceAll('-','+').replaceAll('_','/')), c => c.charCodeAt(0)); }
async function key(password, salt) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 256) throw new Error('Bitte ein Sicherungspasswort mit 12 bis 256 Zeichen eingeben.');
  const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name:'PBKDF2', salt, iterations:600000, hash:'SHA-256' }, base, { name:'AES-GCM',length:256 }, false, ['encrypt','decrypt']);
}
export function collectBackup(storage, memorySnapshot = null) {
  return { format:'bauchgefuehl-full-backup', v:2, createdAt:new Date().toISOString(), memorySnapshot, recovery:storage.getItem(RECOVERY_KEY), raw:Object.fromEntries(BACKUP_KEYS.map(k => [k,storage.getItem(k)])) };
}
export async function encryptBackup(value, password) {
  const plain = enc.encode(JSON.stringify(value)); if (plain.length > LIMIT) throw new Error('Die Sicherung überschreitet 32 MiB. Es wird nichts gekürzt.');
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name:'AES-GCM',iv,additionalData:enc.encode('bauchgefuehl-full-backup-v2') }, await key(password,salt), plain);
  return { format:'bauchgefuehl-encrypted-backup',v:2,kdf:'PBKDF2-SHA256-600000',salt:b64(salt),iv:b64(iv),data:b64(new Uint8Array(data)) };
}
export async function decryptBackup(envelope,password) {
  if (envelope?.format !== 'bauchgefuehl-encrypted-backup' || envelope.v !== 2 || envelope.kdf !== 'PBKDF2-SHA256-600000') throw new Error('Keine unterstützte verschlüsselte Vollsicherung.');
  const salt = un64(envelope.salt,24), iv = un64(envelope.iv,18); if (salt.length !== 16 || iv.length !== 12) throw new Error('Ungültige Verschlüsselungsangaben.');
  let plain;
  try { plain = await crypto.subtle.decrypt({ name:'AES-GCM',iv,additionalData:enc.encode('bauchgefuehl-full-backup-v2') }, await key(password,salt),un64(envelope.data,Math.ceil((LIMIT+16)*4/3))); }
  catch { throw new Error('Passwort falsch oder Sicherung beschädigt. Es wurde nichts geändert.'); }
  return validateFullBackup(JSON.parse(dec.decode(plain)),{ forRestore:false });
}
export function validateFullBackup(value, { forRestore = true } = {}) {
  if (value?.format !== 'bauchgefuehl-full-backup' || value.v !== 2 || !value.raw || BACKUP_KEYS.some(k => !Object.hasOwn(value.raw,k)) || Object.keys(value.raw).some(k => !BACKUP_KEYS.includes(k))) throw new Error('Die Vollsicherung ist unvollständig oder benötigt eine neuere App.');
  const raw = Object.fromEntries(BACKUP_KEYS.map(k => { const v = value.raw[k]; if (v !== null && typeof v !== 'string') throw new Error('Ungültiger Speicherbereich.'); return [k,v]; }));
  if(value.recovery !== null && value.recovery !== undefined && typeof value.recovery !== 'string') throw new Error('Ungültige Import-Sicherungsdaten.');
  if(!forRestore) return {...value,raw};
  if(value.recovery) throw new Error('Diese Datei enthält einen unterbrochenen Import als Rohdaten. Vor Wiederherstellung zuerst den ursprünglichen Import prüfen; es wurde nichts geändert.');
  if(value.memorySnapshot != null) snapshot(value.memorySnapshot);
  const parse = k => raw[k] === null ? undefined : JSON.parse(raw[k]);
  if (raw[STORAGE_KEY]) { const local=parse(STORAGE_KEY); if(![1,2,3].includes(local?.v)) throw new Error('Unbekanntes Schwangerschaftsformat.'); snapshot({profile:local.v===1?{...local.profile,method:'period'}:local.profile,checks:local.checks,journal:local.v===3?local.journal:local.journal??[],schema:3}); }
  if (raw[BIRTH_KEY]) normalizeBirth(parse(BIRTH_KEY));
  if (raw[CARE_KEY]) normalizeCare(parse(CARE_KEY));
  if (raw[COMPANION_KEY]) normalizeCompanion(parse(COMPANION_KEY));
  if (raw[DEVICE_KEY]) normalizeDevice(parse(DEVICE_KEY));
  for (const k of [HISTORY_KEY,BIRTH_HISTORY_KEY,CARE_HISTORY_KEY,COMPANION_HISTORY_KEY]) if (raw[k] && !Array.isArray(parse(k))) throw new Error('Ungültiger Sicherungsverlauf.');
  return { ...value,raw };
}
export function restoreFullBackup(storage, value, { useMemory = false } = {}) {
  const checked = validateFullBackup(value),after={...checked.raw};
  if(useMemory){
    if(!checked.memorySnapshot)throw new Error('Keine gültige Sitzungsfassung in dieser Sicherung.');
    const memory=snapshot(checked.memorySnapshot);
    const history=JSON.parse(after[HISTORY_KEY]||'[]');
    if(after[STORAGE_KEY]) history.unshift({savedAt:new Date().toISOString(),raw:after[STORAGE_KEY]});
    after[HISTORY_KEY]=JSON.stringify(history.slice(0,20));
    after[STORAGE_KEY]=JSON.stringify({v:3,profile:memory.profile,checks:memory.checks,journal:memory.journal});
  }
  commitBundle(storage,after);return checked;
}
