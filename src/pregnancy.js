// All dates are civil calendar dates. UTC is only used as a DST-safe day counter.
export const DAY = 86_400_000;
export const STORAGE_KEY = 'bauchgefuehl.v1';
export const HISTORY_KEY = 'bauchgefuehl.history.v1';

export function todayISO(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function dayNumber(iso) {
  if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) throw new Error('Ungültiges Datum.');
  const [y, m, d] = iso.split('-').map(Number);
  const ms = Date.UTC(y, m - 1, d);
  if (new Date(ms).toISOString().slice(0, 10) !== iso) throw new Error('Ungültiges Datum.');
  return ms / DAY;
}

export function addDays(iso, days) {
  return new Date((dayNumber(iso) + days) * DAY).toISOString().slice(0, 10);
}

export function formatDate(iso, options = {}) {
  return new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC', ...options })
    .format(new Date(dayNumber(iso) * DAY));
}

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

export function calculatePregnancy(profile, today = todayISO()) {
  const p = validateProfile(profile, today);
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
  try { raw = storage.getItem(STORAGE_KEY); } catch { return { profile: null, checks: {}, error: 'Dein Browser erlaubt keinen lokalen Speicher. Du kannst die App für diese Sitzung nutzen.' }; }
  if (!raw) return { profile: null, checks: {}, error: null };
  try {
    const data = JSON.parse(raw);
    if (!data || ![1, 2].includes(data.v)) throw new Error();
    if (data.v === 2 && !['period', 'due-date'].includes(data.profile?.method)) throw new Error();
    const profile = validateProfile(data.v === 1 ? { ...data.profile, method: 'period' } : data.profile, today);
    const checks = {};
    if (data.checks && typeof data.checks === 'object') {
      for (const [key, value] of Object.entries(data.checks)) {
        if (/^[a-z0-9-]{1,40}$/.test(key) && value === true) checks[key] = true;
      }
    }
    return { profile, checks, error: null };
  } catch {
    return { profile: null, checks: {}, error: 'Die gespeicherten Daten sind veraltet oder beschädigt. Bitte trage deine Daten erneut ein.' };
  }
}

export function writeLocal(storage, profile, checks, today = todayISO()) {
  const valid = validateProfile(profile, today);
  const next = JSON.stringify({ v: 2, profile: valid, checks });
  const previous = storage.getItem?.(STORAGE_KEY);
  if (previous && previous !== next) {
    const history = JSON.parse(storage.getItem(HISTORY_KEY) || '[]');
    if (!Array.isArray(history)) throw new Error('Der Sicherungsverlauf ist beschädigt. Bitte zuerst ein Backup herunterladen.');
    history.unshift({ savedAt: new Date().toISOString(), raw: previous });
    // Write the recovery copy first. If it fails, never overwrite the old profile.
    storage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
  }
  storage.setItem(STORAGE_KEY, next);
}
