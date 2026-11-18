import { dayNumber, todayISO } from './dates.js';

export const CARE_KEY = 'bauchgefuehl.care.v1';
export const CARE_HISTORY_KEY = 'bauchgefuehl.care-history.v1';
export const PROVIDERS = { midwife: 'Hebamme', gyn: 'Gynäkologie', other: 'Anderer Termin' };
export const NOTE_KINDS = { note: 'Notiz', qa: 'Frage & Antwort', result: 'Ergebnis / Befund' };
const id = value => { if (typeof value !== 'string' || !/^[a-z0-9-]{8,64}$/i.test(value)) throw new Error('Ungültige Termin-/Notizkennung.'); return value; };
const text = (value, max, required = false) => {
  if (typeof value !== 'string' || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value) || (required && !value.trim())) throw new Error(`Bitte gültigen Text mit höchstens ${max} Zeichen eingeben.`);
  return value.trim();
};
function date(value) { dayNumber(value); if (value < '1900-01-01' || value > '2200-12-31') throw new Error('Datum bitte zwischen 1900 und 2200 wählen.'); return value; }
function stamps(value) {
  for (const stamp of [value.createdAt, value.updatedAt, ...(value.deletedAt == null ? [] : [value.deletedAt])]) {
    if (typeof stamp !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(stamp) || !Number.isFinite(Date.parse(stamp)) || new Date(stamp).toISOString() !== stamp) throw new Error('Ungültiger Änderungszeitpunkt.');
  }
  if (value.updatedAt < value.createdAt || (value.deletedAt && (value.deletedAt < value.createdAt || value.deletedAt > value.updatedAt))) throw new Error('Die Änderungszeitpunkte passen nicht zusammen.');
  return { createdAt: value.createdAt, updatedAt: value.updatedAt, deletedAt: value.deletedAt ?? null };
}
export function normalizeCare(value = { v: 1, appointments: [], notes: [] }, today = todayISO()) {
  if (value?.v !== 1 || !Array.isArray(value.appointments) || !Array.isArray(value.notes)) throw new Error('Unbekanntes Format für Termine und Notizen. Bitte die Rohdaten sichern.');
  if (value.appointments.length > 100 || value.notes.length > 300) throw new Error('Höchstens 100 Termine und 300 Notizen einschließlich Archiv. Es wird nichts gekürzt.');
  const appointments = value.appointments.map(item => {
    if (!Object.hasOwn(PROVIDERS, item.provider)) throw new Error('Bitte eine Terminart wählen.');
    const time = item.time ?? ''; if (typeof time !== 'string' || (time && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time))) throw new Error('Bitte eine gültige Uhrzeit wählen.');
    return { id: id(item.id), date: date(item.date), time, title: text(item.title, 120, true), provider: item.provider, location: text(item.location ?? '', 160), ...stamps(item) };
  });
  const ids = new Set(appointments.map(item => item.id));
  if (ids.size !== appointments.length) throw new Error('Doppelte Terminkennungen.');
  const notes = value.notes.map(item => {
    if (!Object.hasOwn(NOTE_KINDS, item.kind) || typeof item.discussed !== 'boolean') throw new Error('Ungültige Notizart oder Gesprächsangabe.');
    const appointmentId = item.appointmentId == null ? null : id(item.appointmentId);
    if (appointmentId && !ids.has(appointmentId)) throw new Error('Der zugeordnete Termin fehlt. Es wird keine Verknüpfung entfernt.');
    const observed = date(item.date); if (observed > today) throw new Error('Notizen bitte bis einschließlich heute datieren. Termine dürfen in der Zukunft liegen.');
    const answer = text(item.answer ?? '', 3000);
    if (item.kind !== 'qa' && answer) throw new Error('Eine Antwort gehört zu einer Frage. Bitte die Notizart prüfen.');
    return { id: id(item.id), appointmentId, kind: item.kind, date: observed, text: text(item.text, 4000, true), answer, nextSteps: text(item.nextSteps ?? '', 3000), discussed: item.discussed, ...stamps(item) };
  });
  if (new Set(notes.map(item => item.id)).size !== notes.length) throw new Error('Doppelte Notizkennungen.');
  const result = { v: 1, appointments: appointments.sort((a,b) => a.id.localeCompare(b.id)), notes: notes.sort((a,b) => a.id.localeCompare(b.id)) };
  if (new TextEncoder().encode(JSON.stringify(result)).length > 128 * 1024) throw new Error('Termine und Notizen überschreiten 128 KiB. Bitte ein Backup sichern; es wird nichts gekürzt.');
  return result;
}
export function readCare(storage, today) { const raw = storage.getItem(CARE_KEY); return normalizeCare(raw ? JSON.parse(raw) : undefined, today); }
export function writeCare(storage, value, today) {
  const next = JSON.stringify(normalizeCare(value, today)); const previous = storage.getItem(CARE_KEY);
  if (previous && previous !== next) {
    const history = JSON.parse(storage.getItem(CARE_HISTORY_KEY) || '[]'); if (!Array.isArray(history)) throw new Error('Der Termin-Sicherungsverlauf muss geprüft werden.');
    const records = [{ savedAt: new Date().toISOString(), raw: previous }, ...history].slice(0, 20);
    while (records.length > 1 && JSON.stringify(records).length > 512000) records.pop();
    storage.setItem(CARE_HISTORY_KEY, JSON.stringify(records));
  }
  storage.setItem(CARE_KEY, next); return JSON.parse(next);
}
export function upsertCare(value, type, draft, previous = null, now = new Date().toISOString(), today = todayISO()) {
  if (!['appointments', 'notes'].includes(type)) throw new Error('Unbekannter Eintragstyp.');
  const current = normalizeCare(value, today);
  if (previous && !current[type].some(item => item.id === previous.id && item.updatedAt === previous.updatedAt)) throw new Error('Dieser Eintrag wurde inzwischen geändert. Bitte Entwurf sichern und erneut öffnen.');
  const item = { ...draft, id: previous?.id || crypto.randomUUID(), createdAt: previous?.createdAt || now, updatedAt: now, deletedAt: previous?.deletedAt ?? null };
  return normalizeCare({ ...current, [type]: [...current[type].filter(entry => entry.id !== item.id), item] }, today);
}
export function archiveCare(value, type, id, archived, now = new Date().toISOString(), today = todayISO()) {
  if (!value[type]?.some(item => item.id === id)) throw new Error('Eintrag nicht mehr vorhanden.');
  return normalizeCare({ ...value, [type]: value[type].map(item => item.id === id ? { ...item, updatedAt: now, deletedAt: archived ? now : null } : item) }, today);
}
export function careContinuity(incoming, previous, today) {
  const before = normalizeCare(previous, today), after = normalizeCare(incoming, today);
  for (const type of ['appointments', 'notes']) for (const local of before[type]) {
    const remote = after[type].find(item => item.id === local.id);
    if (!remote || remote.updatedAt < local.updatedAt || (remote.updatedAt === local.updatedAt && JSON.stringify(remote) !== JSON.stringify(local))) throw new Error('Der Stand würde Termine oder Notizen verlieren oder zurücksetzen. Bitte Sicherungen prüfen.');
  }
}
export function appointmentsOnDate(value, day) { return value.appointments.filter(item => !item.deletedAt && item.date === day).sort((a,b) => a.time.localeCompare(b.time) || a.id.localeCompare(b.id)); }
export function careCollection(value, { search = '', open = false, archived = false, appointmentId } = {}) {
  const query = search.trim().toLocaleLowerCase('de');
  return value.notes.filter(note => (archived || !note.deletedAt) && (!open || (note.kind === 'qa' && !note.discussed)) && (appointmentId === undefined || note.appointmentId === appointmentId) && (!query || [note.text, note.answer, note.nextSteps, value.appointments.find(item => item.id === note.appointmentId)?.title || ''].join(' ').toLocaleLowerCase('de').includes(query)))
    .sort((a,b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id));
}
