import { dayNumber, formatDate, todayISO } from './dates.js';
import { calculatePregnancy, encodeShare, validateProfile } from './pregnancy.js';

export const REPORT_FIELDS = { text: 'Notizen', symptoms: 'Symptome', tags: 'Tags', metrics: 'Messwerte', time: 'Uhrzeiten' };
export function shareProfile(profile, mode = 'due-date', today = todayISO()) {
  if (mode === 'full') return validateProfile(profile, today);
  if (mode !== 'due-date') throw new Error('Unbekannter Teilen-Umfang.');
  return validateProfile({ method: 'due-date', dueDate: calculatePregnancy(profile, today).dueDate }, today);
}
export function makeShareLink(profile, mode, baseURL, today = todayISO()) {
  const url = new URL(baseURL); url.search = '';
  url.hash = `s=${encodeShare(shareProfile(profile, mode, today), today)}`;
  return url.href;
}
export function projectReport(entries, { from, to, fields = [], excluded = [] } = {}) {
  dayNumber(from); dayNumber(to);
  if (from > to) throw new Error('Der Beginn muss vor oder am Ende des Zeitraums liegen.');
  if (!Array.isArray(fields) || fields.some(key => !Object.hasOwn(REPORT_FIELDS, key))) throw new Error('Unbekannter Berichtsbereich.');
  const enabled = [...new Set(fields)];
  const omit = new Set(excluded);
  const projected = !enabled.length ? [] : entries.filter(entry => !entry.deletedAt && entry.date >= from && entry.date <= to && !omit.has(entry.id)).flatMap(entry => {
    const result = { date: entry.date };
    if (enabled.includes('time') && entry.time) result.time = entry.time;
    if (enabled.includes('text') && entry.text) result.text = entry.text;
    if (enabled.includes('symptoms') && entry.symptoms.length) result.symptoms = [...entry.symptoms];
    if (enabled.includes('tags') && entry.tags.length) result.tags = [...entry.tags];
    if (enabled.includes('metrics') && entry.metrics.length) result.metrics = entry.metrics.map(metric => ({ label: metric.label, unit: metric.unit, value: metric.value }));
    // Do not disclose dates for entries that have no selected content (time alone is explicit content).
    return Object.keys(result).length > 1 ? [result] : [];
  }).sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));
  return { from, to, fields: enabled, entries: projected };
}
export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export function reportBody(report) {
  const e = escapeHtml;
  const number = value => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 4 }).format(value);
  return `<header><p>BAUCHGEFÜHL · PERSÖNLICHER JOURNALAUSZUG</p><h1>Deine ausgewählten Beobachtungen</h1><p>${e(formatDate(report.from))} – ${e(formatDate(report.to))}</p><p>Enthalten: ${report.fields.map(key => e(REPORT_FIELDS[key])).join(', ') || 'keine Bereiche'} · ${report.entries.length} ${report.entries.length === 1 ? 'Eintrag' : 'Einträge'}</p></header><p class="report-note">Quelle der Daten: persönliche Journaleinträge. Dieser bewusst unvollständige Auszug enthält nur die ausgewählten Bereiche und Einträge. Fehlende Angaben bedeuten keine Beschwerdefreiheit. Keine medizinische Bewertung.</p>${report.entries.map(entry => `<article class="report-entry"><h2>${e(formatDate(entry.date))}${entry.time ? ` · ${e(entry.time)} Uhr` : ''}</h2>${entry.text ? `<h3>Notiz</h3><p class="report-text">${e(entry.text)}</p>` : ''}${entry.symptoms ? `<h3>Symptome</h3><p>${entry.symptoms.map(e).join(', ')}</p>` : ''}${entry.tags ? `<h3>Tags</h3><p>${entry.tags.map(value => `#${e(value)}`).join(' ')}</p>` : ''}${entry.metrics ? `<h3>Messwerte</h3><ul>${entry.metrics.map(metric => `<li>${e(metric.label)}: ${e(number(metric.value))} ${e(metric.unit)}</li>`).join('')}</ul>` : ''}</article>`).join('')}${report.entries.length ? '' : '<p>Keine Einträge mit den ausgewählten Bereichen in diesem Zeitraum.</p>'}`;
}
export function reportDocument(report) {
  // Fully self-contained. No script, remote asset, raw snapshot, credentials or hidden excluded values.
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>Persönlicher Journalauszug</title><style>body{font:16px/1.65 system-ui,sans-serif;color:#283c33;max-width:760px;margin:35px auto;padding:0 20px}h1{font:32px Georgia,serif}h2{font:24px Georgia,serif}h3{font-size:16px;margin-bottom:4px}.report-note{background:#f1f3ed;padding:16px}.report-entry{border-top:1px solid #d9dfd3;padding:18px 0;break-inside:avoid}.report-text{white-space:pre-wrap;overflow-wrap:anywhere}p,li{overflow-wrap:anywhere}@media print{body{margin:0;max-width:none}}</style></head><body>${reportBody(report)}</body></html>`;
}
