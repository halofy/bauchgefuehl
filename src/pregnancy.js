import { readCompanion } from './companion.js';
import { todayISO, dayNumber, addDays } from './dates.js';
export { todayISO, dayNumber, addDays, formatDate } from './dates.js';
import { normalizeJournal, assertJournalContinuity, MAX_SNAPSHOT_BYTES } from './journal.js';

// All dates are civil calendar dates. UTC is only used as a DST-safe day counter.
export const DAY = 86_400_000;
export const STORAGE_KEY = 'bauchgefuehl.v1';
export const HISTORY_KEY = 'bauchgefuehl.history.v1';

export function validateProfile(value, today = todayISO()) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Die Schwangerschaftsdaten sind ungültig.');
  const method = value.method === undefined ? 'period' : value.method;
  if (!['period', 'due-date'].includes(method)) throw new Error('Bitte wähle eine gültige Berechnungsmethode.');
  const now = dayNumber(today);
  if (method === 'due-date') {
    let due;
    try { due = dayNumber(value.dueDate); } catch { throw new Error('Bitte gib einen gültigen voraussichtlichen Geburtstermin (ET) ein.'); }
    if (due > now + 280 || due < now - 86) throw new Error('Bitte prüfe den ET: Er darf höchstens 40 Wochen in der Zukunft oder 86 Tage zurückliegen.');
    // Only retain the active method's inputs; a reconstructed LMP is not observed data.
    return { method, dueDate: value.dueDate };
  }
  let period;
  try { period = dayNumber(value.lmp); } catch { throw new Error('Bitte gib ein gültiges Datum für den ersten Tag der letzten Periode ein.'); }
  if (period > now) throw new Error('Der erste Tag der letzten Periode darf nicht in der Zukunft liegen.');
  if (now - period > 366) throw new Error('Das Datum liegt über ein Jahr zurück. Bitte prüfe deine Eingabe.');
  if (!Number.isInteger(value.cycle) || value.cycle < 15 || value.cycle > 60) {
    throw new Error('Bitte gib eine durchschnittliche Zykluslänge von 15 bis 60 ganzen Tagen ein.');
  }
  if (value.irregular !== undefined && typeof value.irregular !== 'boolean') throw new Error('Die Angabe zum Zyklus ist ungültig.');
  return { method, lmp: value.lmp, cycle: value.cycle, irregular: value.irregular === true };
}

// Existing pregnancies remain readable after birth. New profile entry still uses validateProfile's recency checks.
export function validateStoredProfile(value, today = todayISO()) {
  try { return validateProfile(value,today); } catch (original) {
    const reference = value?.method === 'due-date' ? value.dueDate : value?.lmp;
    let elapsed; try { elapsed = dayNumber(today)-dayNumber(reference); } catch { throw original; }
    if (reference < '1900-01-01' || elapsed <= (value?.method === 'due-date' ? 86 : 366)) throw original;
    return validateProfile(value,reference);
  }
}

export function calculatePregnancy(profile, today = todayISO()) {
  const p = validateStoredProfile(profile, today);
  const fromDueDate = p.method === 'due-date';
  const referenceDate = fromDueDate ? addDays(p.dueDate, -280) : p.lmp;
  const elapsedDays = dayNumber(today) - dayNumber(referenceDate);
  const correction = fromDueDate ? 0 : p.cycle - 28;
  // The selected method alone determines the age: period/cycle or ET at 40+0.
  const gestationalDays = elapsedDays - correction;
  const weeks = Math.floor(gestationalDays / 7);
  const days = ((gestationalDays % 7) + 7) % 7;
  const dueDate = fromDueDate ? p.dueDate : addDays(p.lmp, 280 + correction);
  return {
    method: p.method,
    elapsedDays, correction, gestationalDays, weeks, days,
    weekNumber: weeks + 1,
    trimester: gestationalDays < 98 ? 1 : gestationalDays < 196 ? 2 : 3,
    dueDate,
    daysUntilDue: 280 - gestationalDays,
    progress: Math.max(0, Math.min(100, gestationalDays / 280 * 100)),
    calendarWeeks: Math.floor(elapsedDays / 7),
    calendarDays: elapsedDays % 7,
    uncertain: !fromDueDate && (p.irregular || p.cycle < 21 || p.cycle > 35),
    status: gestationalDays < 0 ? 'before' : gestationalDays >= 294 ? 'beyond' : 'ongoing',
  };
}

export function demoProfile(today = todayISO()) {
  // A rolling, explicitly labelled example at 18+3 with a 30-day cycle.
  return { method: 'period', lmp: addDays(today, -(18 * 7 + 3 + 2)), cycle: 30, irregular: false };
}

export function encodeShare(profile, today = todayISO()) {
  const p = validateProfile(profile, today);
  const payload = p.method === 'due-date'
    ? { v: 2, m: p.method, d: p.dueDate }
    : { v: 2, m: p.method, p: p.lmp, c: p.cycle, i: p.irregular ? 1 : 0 };
  return btoa(JSON.stringify(payload))
    .replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

export function decodeShare(hash, today = todayISO()) {
  if (!hash.startsWith('#s=')) return null;
  const value = hash.slice(3);
  if (!value || value.length > 1024 || !/^[a-zA-Z0-9_-]+$/.test(value)) throw new Error('Dieser Teilen-Link ist ungültig oder beschädigt.');
  try {
    const data = JSON.parse(atob(value.replaceAll('-', '+').replaceAll('_', '/')));
    if (!data || ![1, 2].includes(data.v)) throw new Error();
    if (data.v === 2 && data.m === 'due-date') return validateProfile({ method: 'due-date', dueDate: data.d }, today);
    if (data.v === 2 && data.m !== 'period') throw new Error();
    if (! [0, 1].includes(data.i)) throw new Error();
    return validateProfile({ method: 'period', lmp: data.p, cycle: data.c, irregular: data.i === 1 }, today);
  } catch {
    throw new Error('Dieser Teilen-Link ist ungültig, veraltet oder enthält unplausible Daten. Deine gespeicherten Daten bleiben erhalten.');
  }
}

export function readLocal(storage, today = todayISO()) {
  let raw;
  try { raw = storage.getItem(STORAGE_KEY); } catch { return { profile: null, checks: {}, journal: [], error: 'Dein Browser erlaubt keinen lokalen Speicher. Du kannst die App für diese Sitzung nutzen.' }; }
  if (!raw) return { profile: null, checks: {}, journal: [], error: null };
  try {
    const data = JSON.parse(raw);
    if (!data || ![1, 2, 3].includes(data.v)) throw new Error();
    if (data.v >= 2 && !['period', 'due-date'].includes(data.profile?.method)) throw new Error();
    if (data.v === 3 && !Array.isArray(data.journal)) throw new Error();
    const journal = normalizeJournal(data.journal, today);
    const checks = {};
    if (data.checks && typeof data.checks === 'object') {
      for (const [key, value] of Object.entries(data.checks)) {
        if (/^[a-z0-9-]{1,40}$/.test(key) && value === true) checks[key] = true;
      }
    }
    let profile;
    try { let postpartum=false; try { postpartum=!!readCompanion(storage,today).birthDate; } catch { /* Invalid planning does not authorize a phase change. */ } profile = (postpartum ? validateStoredProfile : validateProfile)(data.v === 1 ? { ...data.profile, method: 'period' } : data.profile, today); }
    catch { return { profile: null, checks, journal, error: 'Die Berechnungsgrundlage muss aktualisiert werden. Dein Journal bleibt sichtbar und gespeichert.' }; }
    return { profile, checks, journal, error: null };
  } catch {
    return { profile: null, checks: {}, journal: [], error: 'Die gespeicherten Daten sind veraltet oder beschädigt. Bitte sichere ein Backup, bevor du sie änderst.' };
  }
}

export function writeLocal(storage, profile, checks, today = todayISO(), journal, { replaceJournal = false } = {}) {
  let postpartum=false; try { postpartum=!!readCompanion(storage,today).birthDate; } catch { /* Preserve strict validation without an explicit phase. */ }
  const valid = (postpartum ? validateStoredProfile : validateProfile)(profile, today);
  const previous = storage.getItem?.(STORAGE_KEY);
  let previousData = null;
  try { if (previous) previousData = JSON.parse(previous); } catch { /* Archive damaged raw data before replacing it. */ }
  const entries = normalizeJournal(journal === undefined ? previousData?.journal : journal, today);
  if (previousData?.journal && !replaceJournal) assertJournalContinuity(entries, normalizeJournal(previousData.journal, today));
  const next = JSON.stringify({ v: 3, profile: valid, checks, journal: entries });
  // Reserve room for the sync schema header so a saved journal also fits there.
  if (new TextEncoder().encode(next).length > MAX_SNAPSHOT_BYTES - 64) throw new Error('Der Datenstand überschreitet 512 KiB. Bitte zuerst ein Backup sichern; vorhandene Einträge werden nicht gekürzt.');
  if (previous && previous !== next) {
    const history = JSON.parse(storage.getItem(HISTORY_KEY) || '[]');
    if (!Array.isArray(history)) throw new Error('Der Sicherungsverlauf ist beschädigt. Bitte zuerst ein Backup herunterladen.');
    history.unshift({ savedAt: new Date().toISOString(), raw: previous });
    history.splice(20);
    while (history.length > 1 && new TextEncoder().encode(JSON.stringify(history)).length > 2 * 1024 * 1024) history.pop();
    // Write the recovery copy first. If it fails, never overwrite the old profile.
    storage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
  }
  storage.setItem(STORAGE_KEY, next);
}
