import { todayISO, dayNumber } from './dates.js';

export const MAX_SNAPSHOT_BYTES = 512 * 1024;
export const METRICS = {
  weight: { label: 'Gewicht', unit: 'kg' },
  belly: { label: 'Bauchumfang', unit: 'cm' },
  chest: { label: 'Brustumfang', unit: 'cm' },
  hips: { label: 'Hüftumfang', unit: 'cm' },
  temperature: { label: 'Körpertemperatur', unit: '°C' },
};
export const SYMPTOMS = ['Müdigkeit', 'Übelkeit', 'Sodbrennen', 'Rückenschmerzen', 'Kopfschmerzen', 'Schlafprobleme'];

export function parseLabels(text) {
  const seen = new Set();
  return text.split(',').map(value => value.trim().replace(/^#+/, '')).filter(value => {
    const key = value.toLocaleLowerCase('de');
    if (!value || seen.has(key)) return false;
    seen.add(key); return true;
  });
}
function string(value, max, name, empty = true) {
  if (typeof value !== 'string' || value.length > max || (!empty && !value.trim()) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new Error(`${name} ist ungültig oder zu lang (maximal ${max} Zeichen).`);
  return value.trim();
}
function labels(value, name) {
  if (!Array.isArray(value) || value.length > 20) throw new Error(`Bitte höchstens 20 ${name} pro Eintrag erfassen.`);
  const result = parseLabels(value.map(item => string(item, 50, name, false)).join(','));
  if (result.length > 20) throw new Error(`Bitte höchstens 20 ${name} pro Eintrag erfassen.`);
  return result;
}
function timestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) || !Number.isFinite(Date.parse(value))) throw new Error('Ungültiger Änderungszeitpunkt.');
  if (new Date(value).toISOString() !== value) throw new Error('Ungültiger Änderungszeitpunkt.');
  return value;
}
export function parseMeasurement(value) {
  const text = String(value).trim();
  if (!/^[+-]?\d+(?:[.,]\d+)?$/.test(text)) throw new Error('Bitte einen gültigen Messwert eingeben, zum Beispiel 65,5.');
  const result = Number(text.replace(',', '.'));
  if (!Number.isFinite(result) || Math.abs(result) > 1_000_000) throw new Error('Der Messwert liegt außerhalb des unterstützten Zahlenbereichs.');
  return result;
}
export function normalizeMetric(value) {
  if (!value || (value.kind !== 'custom' && !Object.hasOwn(METRICS, value.kind))) throw new Error('Unbekannte Messgröße.');
  if (typeof value.value !== 'number' || !Number.isFinite(value.value) || Math.abs(value.value) > 1_000_000) throw new Error('Ungültiger Messwert.');
  if (value.kind !== 'custom' && value.value < 0) throw new Error('Für diese Messgröße bitte einen Wert ab 0 eingeben.');
  const definition = value.kind === 'custom' ? { label: string(value.label, 50, 'Name der Messgröße', false), unit: string(value.unit ?? '', 16, 'Einheit') } : METRICS[value.kind];
  return { kind: value.kind, ...definition, value: value.value };
}
export const metricKey = metric => JSON.stringify([metric.kind, metric.kind === 'custom' ? metric.label.toLocaleLowerCase('de') : '', metric.unit]);

export function normalizeEntry(value, today = todayISO()) {
  if (!value || typeof value !== 'object' || !/^[a-z0-9-]{8,64}$/i.test(value.id)) throw new Error('Ungültige Eintragskennung.');
  let date;
  try { date = dayNumber(value.date); } catch { throw new Error('Bitte ein gültiges Datum für den Eintrag angeben.'); }
  if (value.date < '1900-01-01' || date > dayNumber(today)) throw new Error('Einträge müssen zwischen 1900 und heute liegen.');
  const time = value.time ?? '';
  if (typeof time !== 'string' || (time !== '' && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time))) throw new Error('Bitte eine gültige Uhrzeit angeben.');
  const text = string(value.text ?? '', 4000, 'Notiz');
  const symptoms = labels(value.symptoms ?? [], 'Symptome');
  const tags = labels(value.tags ?? [], 'Tags');
  if (!Array.isArray(value.metrics ?? []) || (value.metrics?.length || 0) > 12) throw new Error('Bitte höchstens 12 Messwerte pro Eintrag erfassen.');
  const metrics = (value.metrics ?? []).map(normalizeMetric);
  if (new Set(metrics.map(metricKey)).size !== metrics.length) throw new Error('Eine Messgröße darf pro Eintrag nur einmal vorkommen.');
  if (!text && !symptoms.length && !tags.length && !metrics.length) throw new Error('Bitte eine Notiz, ein Symptom, einen Tag oder einen Messwert erfassen.');
  const createdAt = timestamp(value.createdAt);
  const updatedAt = timestamp(value.updatedAt);
  const deletedAt = value.deletedAt == null ? null : timestamp(value.deletedAt);
  if (updatedAt < createdAt || (deletedAt && (deletedAt < createdAt || deletedAt > updatedAt))) throw new Error('Die Änderungszeitpunkte passen nicht zusammen.');
  return { id: value.id, date: value.date, time, text, symptoms, tags, metrics, createdAt, updatedAt, deletedAt };
}

export function normalizeJournal(value = [], today = todayISO()) {
  if (!Array.isArray(value) || value.length > 1000) throw new Error('Das Journal unterstützt höchstens 1.000 Einträge. Vorhandene Daten werden nicht gekürzt.');
  const entries = value.map(entry => normalizeEntry(entry, today));
  if (new Set(entries.map(entry => entry.id)).size !== entries.length) throw new Error('Das Journal enthält doppelte Eintragskennungen.');
  return entries.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
}
export function assertJournalContinuity(next, previous) {
  const ids = new Set(next.map(entry => entry.id));
  if (previous.some(entry => !ids.has(entry.id))) throw new Error('Der neue Stand würde Journaleinträge verlieren. Übertragung gestoppt; bitte ein Backup sichern und den Stand prüfen.');
}
export function upsertEntry(entries, draft, previous = null, now = new Date().toISOString()) {
  const entry = normalizeEntry({ ...draft, id: previous?.id || crypto.randomUUID(), createdAt: previous?.createdAt || now, updatedAt: now, deletedAt: previous?.deletedAt ?? null });
  return normalizeJournal([...entries.filter(item => item.id !== entry.id), entry]);
}
export function archiveEntry(entries, id, archived, now = new Date().toISOString()) {
  if (!entries.some(entry => entry.id === id)) throw new Error('Dieser Eintrag ist nicht mehr vorhanden.');
  return normalizeJournal(entries.map(entry => entry.id === id ? { ...entry, deletedAt: archived ? now : null, updatedAt: now } : entry));
}
export function filterEntries(entries, { search = '', tag = '', from = '', to = '', archived = false } = {}) {
  const query = search.trim().toLocaleLowerCase('de');
  return entries.filter(entry => (archived || !entry.deletedAt) && (!from || entry.date >= from) && (!to || entry.date <= to) && (!tag || entry.tags.includes(tag)) && (!query || [entry.text, ...entry.tags, ...entry.symptoms, ...entry.metrics.map(m => `${m.label} ${m.value} ${m.unit}`)].join(' ').toLocaleLowerCase('de').includes(query)))
    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time) || b.createdAt.localeCompare(a.createdAt));
}
export function metricSeries(entries, key) {
  return entries.filter(entry => !entry.deletedAt).flatMap(entry => entry.metrics.filter(metric => metricKey(metric) === key).map(metric => ({ date: entry.date, time: entry.time, id: entry.id, value: metric.value, label: metric.label, unit: metric.unit })))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.id.localeCompare(b.id));
}
export function journalCsv(entries) {
  const definitions = new Map();
  for (const entry of entries) for (const metric of entry.metrics) definitions.set(metricKey(metric), metric);
  const keys = [...definitions.keys()];
  const cell = (value, numeric = false) => {
    let text = String(value ?? '');
    if (!numeric && /^[\s]*[=+@-]/.test(text)) text = "'" + text;
    return `"${text.replaceAll('"', '""')}"`;
  };
  const rows = [['Datum', 'Uhrzeit', 'Symptome', 'Tags', 'Notiz', 'Archiviert', ...keys.map(key => { const m = definitions.get(key); return `${m.label}${m.unit ? ` (${m.unit})` : ''}`; })].map(value => cell(value)).join(';')];
  for (const entry of [...entries].reverse()) {
    const values = new Map(entry.metrics.map(metric => [metricKey(metric), metric.value]));
    rows.push([entry.date, entry.time, entry.symptoms.join(', '), entry.tags.join(', '), entry.text, entry.deletedAt ? 'Ja' : 'Nein'].map(value => cell(value)).concat(keys.map(key => cell(values.has(key) ? String(values.get(key)).replace('.', ',') : '', true))).join(';'));
  }
  return '\ufeff' + rows.join('\r\n');
}
