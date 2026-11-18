import { todayISO } from './dates.js';
import { normalizeEntry, normalizeJournal } from './journal.js';

export const BIRTH_KEY = 'bauchgefuehl.birth.v1';
export const BIRTH_HISTORY_KEY = 'bauchgefuehl.birth-history.v1';
export const BIRTH_SOURCES = {
  birth: 'https://www.familienplanung.de/geburt/rund-um-die-geburt/wie-verlaeuft-eine-geburt/',
  early: 'https://www.gesundheitsinformation.de/was-kann-man-tun-wenn-sich-eine-fruehgeburt-ankuendigt.html',
  viability: 'https://www.uniklinik-duesseldorf.de/ueber-uns/pressemitteilungen/detail/ein-fruehchen-kommt-immer-via-kaiserschnitt-und-darf-nicht-angefasst-werden-stimmt-nicht',
};
export function phoneNumber(value) {
  if (typeof value !== 'string' || value.length > 40 || !/^\+?[0-9 ()/.-]+$/.test(value.trim())) throw new Error('Bitte eine Telefonnummer mit Ziffern und optional führendem + eingeben.');
  const number = value.trim().replace(/[ ()/.-]/g, '');
  if (!/^\+?\d{3,20}$/.test(number)) throw new Error('Bitte eine Telefonnummer mit 3 bis 20 Ziffern eingeben.');
  return number;
}
export function normalizeBirth(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || (value.v !== undefined && value.v !== 1)) throw new Error('Unbekannter Geburtshilfe-Datenstand.');
  const contacts = value.contacts ?? [];
  if (value.mode !== undefined && !['first', 'subsequent'].includes(value.mode)) throw new Error('Unbekannte Geburtsangabe.');
  if (!Array.isArray(contacts) || contacts.length > 3) throw new Error('Es sind höchstens drei Kontakte möglich.');
  const clean = contacts.map(contact => {
    if (typeof contact?.name !== 'string' || !contact.name.trim() || contact.name.length > 80 || /[\u0000-\u001f]/.test(contact.name)) throw new Error('Bitte für jeden Kontakt einen Namen mit höchstens 80 Zeichen eingeben.');
    return { name: contact.name.trim(), phone: phoneNumber(contact.phone) };
  });
  let active = null;
  if (value.active != null) {
    const item = value.active;
    if (!Number.isSafeInteger(item.startedAt) || item.startedAt < 946684800000 || item.startedAt > 7289654400000 || !new RegExp(`^contraction-${item.startedAt}-[a-f0-9-]{8,36}$`).test(item.id)) throw new Error('Die offene Wehenmessung ist ungültig.');
    active = { id: item.id, startedAt: item.startedAt };
  }
  return { v: 1, contacts: clean, active, mode: value.mode === 'subsequent' ? 'subsequent' : 'first' };
}
export function readBirth(storage) {
  const raw = storage.getItem(BIRTH_KEY);
  return normalizeBirth(raw ? JSON.parse(raw) : {});
}
export function writeBirth(storage, value) {
  const next = JSON.stringify(normalizeBirth(value));
  const previous = storage.getItem(BIRTH_KEY);
  if (previous && previous !== next) {
    const history = JSON.parse(storage.getItem(BIRTH_HISTORY_KEY) || '[]');
    if (!Array.isArray(history)) throw new Error('Der Sicherungsverlauf der Kontakte ist beschädigt. Bitte zuerst ein Backup sichern.');
    storage.setItem(BIRTH_HISTORY_KEY, JSON.stringify([{ savedAt: new Date().toISOString(), raw: previous }, ...history].slice(0, 30)));
  }
  storage.setItem(BIRTH_KEY, next);
  return JSON.parse(next);
}
export function startContraction(now = Date.now(), random = crypto.randomUUID()) {
  return normalizeBirth({ active: { id: `contraction-${now}-${random}`, startedAt: now } }).active;
}
export function finishContraction(entries, active, end = Date.now(), { excluded = false, today = todayISO(new Date(end)) } = {}) {
  const pending = normalizeBirth({ active }).active;
  if (!pending) throw new Error('Keine laufende Messung.');
  // Retry after an interrupted save is idempotent; an already logged measurement is never overwritten.
  if (entries.some(entry => entry.id === pending.id)) return normalizeJournal(entries, today);
  if (!Number.isSafeInteger(end) || end <= pending.startedAt || end - pending.startedAt > 86400000) throw new Error('Bitte eine Endzeit nach dem Beginn und innerhalb von 24 Stunden wählen.');
  const stamp = new Date(end).toISOString();
  const start = new Date(pending.startedAt);
  const previous = contractionMeasurements(entries).filter(item => item.startedAt < pending.startedAt).at(-1);
  const metrics = [{ kind: 'custom', label: 'Wehendauer', unit: 's', value: Math.round((end - pending.startedAt) / 1000) }];
  if (previous && pending.startedAt - previous.startedAt <= 3600000) metrics.push({ kind: 'custom', label: 'Abstand Wehenbeginn', unit: 's', value: Math.round((pending.startedAt - previous.startedAt) / 1000) });
  const entry = normalizeEntry({ id: pending.id, date: todayISO(start), time: `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`, text: `Selbst gemessene Kontraktion. Ende: ${new Date(end).toLocaleString('de-DE')}.${excluded ? ' Messung ausdrücklich nicht für die Musterübersicht gewertet.' : ''}`, symptoms: [], tags: excluded ? ['Wehen', 'Nicht werten'] : ['Wehen'], metrics, createdAt: stamp, updatedAt: stamp, deletedAt: null }, today);
  return normalizeJournal([...entries, entry], today);
}
export function contractionMeasurements(entries) {
  return entries.flatMap(entry => {
    const match = /^contraction-(\d{13})-[a-f0-9-]{8,36}$/.exec(entry.id);
    const duration = entry.metrics.find(metric => metric.kind === 'custom' && metric.label === 'Wehendauer' && metric.unit === 's')?.value;
    if (!match || entry.deletedAt || entry.tags.includes('Nicht werten') || !Number.isFinite(duration) || duration <= 0) return [];
    return [{ id: entry.id, date: entry.date, time: entry.time, startedAt: Number(match[1]), duration, endedAt: Number(match[1]) + duration * 1000 }];
  }).sort((a, b) => a.startedAt - b.startedAt);
}
export function contractionPattern(entries, now = Date.now(), mode = 'first') {
  const recent = contractionMeasurements(entries).filter(item => item.startedAt >= now - 7200000 && item.endedAt <= now);
  const latest = recent.at(-1);
  const maxGap = mode === 'subsequent' ? 600000 : 300000;
  let chain = [];
  for (const item of recent) {
    const previous = chain.at(-1);
    if (item.duration < 60 || item.duration > 180) { chain = []; continue; }
    if (previous && (item.startedAt < previous.endedAt || item.startedAt - previous.startedAt > maxGap)) chain = [];
    chain.push(item);
  }
  const fresh = latest && now - latest.endedAt <= 900000;
  const span = chain.length > 1 ? chain.at(-1).startedAt - chain[0].startedAt : 0;
  const gaps = chain.slice(1).map((item, index) => item.startedAt - chain[index].startedAt);
  const regular = gaps.length > 0 && Math.max(...gaps) <= Math.min(...gaps) * 1.3;
  const matched = Boolean(fresh && regular && chain.length >= 3 && (mode === 'subsequent' || span >= 3600000));
  return { measurements: recent, matched, count: recent.length, span, last: latest || null, regular: Boolean(fresh && regular), maxGapSeconds: maxGap / 1000 };
}
export function showContractionFab(age, active, ownProfile = true) {
  return Boolean(active || (ownProfile && Number.isInteger(age) && age >= 154));
}
