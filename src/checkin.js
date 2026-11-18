import { isCheckinEntry, parseMeasurement, upsertEntry } from './journal.js';

// Product scales for personal observations, not clinical questionnaires or thresholds.
export const CHECKIN_FIELDS = {
  mood: { label: 'Stimmung', storedLabel: 'Check-in: Stimmung', unit: '1–5', min: 1, max: 5, integer: true, choices: ['Sehr belastet', 'Eher belastet', 'Gemischt / neutral', 'Eher gut', 'Sehr gut'] },
  energy: { label: 'Energie', storedLabel: 'Check-in: Energie', unit: '1–5', min: 1, max: 5, integer: true, choices: ['Kaum Energie', 'Wenig Energie', 'Mittlere Energie', 'Viel Energie', 'Sehr viel Energie'] },
  sleep: { label: 'Schlaf · letzte 24 Stunden', storedLabel: 'Check-in: Schlafdauer', unit: 'h', min: 0, max: 24, integer: false },
  intensity: { label: 'Stärkste Beschwerden · jetzt', storedLabel: 'Check-in: Beschwerdestärke', unit: '0–10', min: 0, max: 10, integer: true },
};
export function checkinField(metric) {
  return metric.kind === 'custom' ? Object.keys(CHECKIN_FIELDS).find(key => CHECKIN_FIELDS[key].storedLabel.toLocaleLowerCase('de') === metric.label.toLocaleLowerCase('de')) : undefined;
}
export const isCheckinMetric = (entry, metric) => isCheckinEntry(entry) && Boolean(checkinField(metric));
function valid(value, field) {
  return Number.isFinite(value) && value >= field.min && value <= field.max && (!field.integer || Number.isInteger(value));
}
export function checkinMetrics(values = {}) {
  return Object.entries(CHECKIN_FIELDS).flatMap(([key, field]) => {
    const raw = values[key];
    if (raw === undefined || raw === null || (typeof raw === 'string' && !raw.trim())) return [];
    if (!['number', 'string'].includes(typeof raw)) throw new Error(`${field.label}: Bitte einen gültigen Wert eingeben.`);
    const value = parseMeasurement(raw);
    if (!valid(value, field)) throw new Error(`${field.label}: Bitte ${field.integer ? 'eine ganze Zahl' : 'einen Wert'} von ${field.min} bis ${field.max} eingeben.`);
    return [{ kind: 'custom', label: field.storedLabel, unit: field.unit, value }];
  });
}
export function readCheckin(entry) {
  if (!isCheckinEntry(entry)) return null;
  const values = {}; const invalid = [];
  for (const metric of entry.metrics) {
    const key = checkinField(metric); if (!key) continue;
    const field = CHECKIN_FIELDS[key];
    if (metric.unit !== field.unit || !valid(metric.value, field) || Object.hasOwn(values, key) || invalid.includes(key)) {
      delete values[key]; if (!invalid.includes(key)) invalid.push(key);
    } else values[key] = metric.value;
  }
  return { values, invalid };
}
export function checkinValue(key, value) {
  const field = CHECKIN_FIELDS[key];
  if (field.choices) return `${field.choices[value - 1]} (${value}/5)`;
  if (key === 'intensity') return `${value}/10${value === 0 ? ' · keine Beschwerden angegeben' : ''}`;
  return `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 4 }).format(value)} h`;
}
export function upsertCheckin(entries, draft, values, previous = null, now = new Date().toISOString()) {
  if (previous && !isCheckinEntry(previous)) throw new Error('Dieser Eintrag ist kein strukturierter Check-in.');
  if ((draft.metrics || []).some(metric => checkinField(metric))) throw new Error('Bitte Check-in-Angaben in den vier strukturierten Feldern erfassen. Gleichnamige weitere Messwertzeilen zuerst bewusst korrigieren oder entfernen.');
  const metrics = [...checkinMetrics(values), ...(draft.metrics || [])];
  const identity = previous || { id: `checkin-${crypto.randomUUID()}`, createdAt: now, deletedAt: null };
  return upsertEntry(entries, { ...draft, metrics }, identity, now);
}
export function summarizeCheckins(entries) {
  const observations = entries.filter(entry => !entry.deletedAt && isCheckinEntry(entry))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  const fields = Object.entries(CHECKIN_FIELDS).map(([key, field]) => {
    const points = []; let missing = 0; let invalid = 0;
    for (const entry of observations) {
      const data = readCheckin(entry);
      if (data.invalid.includes(key)) invalid++;
      else if (!Object.hasOwn(data.values, key)) missing++;
      else points.push({ date: entry.date, time: entry.time, entryId: entry.id, value: data.values[key] });
    }
    return { key, label: field.label, unit: field.unit, points, count: points.length, dayCount: new Set(points.map(point => point.date)).size, missing, invalid, first: points[0] || null, last: points.at(-1) || null };
  });
  return { count: observations.length, dayCount: new Set(observations.map(entry => entry.date)).size, fields };
}
