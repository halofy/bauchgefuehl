import { dayNumber, formatDate, todayISO } from './dates.js';
import { calculatePregnancy, encodeShare, validateProfile } from './pregnancy.js';
import { isCheckinMetric } from './checkin.js';
import { normalizeCare, PROVIDERS } from './care.js';

export const REPORT_FIELDS = { text: 'Journalnotizen', symptoms: 'Symptome', tags: 'Tags', metrics: 'Weitere Messwerte', checkin: 'Tages-Check-in', time: 'Journal-Uhrzeiten', careNotes: 'Terminnotizen & Antworten', appointments: 'Termindaten einschließlich Uhrzeit / Ort' };
export const reportItemCount = report => report.entries.length + (report.careNotes?.length || 0) + (report.appointments?.length || 0);
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
export function projectReport(entries, { from, to, fields = [], excluded = [], care } = {}) {
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
    const metric = item => ({ label: item.label, unit: item.unit, value: item.value });
    const checkin = entry.metrics.filter(item => isCheckinMetric(entry, item));
    const others = entry.metrics.filter(item => !isCheckinMetric(entry, item));
    if (enabled.includes('metrics') && others.length) result.metrics = others.map(metric);
    if (enabled.includes('checkin') && checkin.length) result.checkin = checkin.map(metric);
    // Do not disclose dates for entries that have no selected content (time alone is explicit content).
    return Object.keys(result).length > 1 ? [result] : [];
  }).sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));
  const result = { from, to, fields: enabled, entries: projected };
  if (enabled.includes('careNotes') || enabled.includes('appointments')) {
    const data = normalizeCare(care);
    const appointment = item => ({ date: item.date, time: item.time, title: item.title, provider: PROVIDERS[item.provider], location: item.location });
    if (enabled.includes('careNotes')) result.careNotes = data.notes.filter(item => !item.deletedAt && item.date >= from && item.date <= to && !omit.has('care-note:' + item.id)).map(item => ({ date: item.date, kind: item.kind, text: item.text, ...(item.kind === 'qa' && item.answer ? { answer: item.answer } : {}), ...(item.nextSteps ? { nextSteps: item.nextSteps } : {}), discussed: item.discussed, ...(enabled.includes('appointments') && item.appointmentId && !omit.has('care-appointment:' + item.appointmentId) ? { appointment: appointment(data.appointments.find(a => a.id === item.appointmentId)) } : {}) }));
    if (enabled.includes('appointments')) result.appointments = data.appointments.filter(item => !item.deletedAt && item.date >= from && item.date <= to && !omit.has('care-appointment:' + item.id)).map(appointment);
  }
  return result;
}
export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export function reportBody(report) {
  const e = escapeHtml;
  const number = value => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 4 }).format(value);
  return `<header><p>BAUCHGEFÜHL · PERSÖNLICHER JOURNALAUSZUG</p><h1>Deine ausgewählten Beobachtungen</h1><p>${e(formatDate(report.from))} – ${e(formatDate(report.to))}</p><p>Enthalten: ${report.fields.map(key => e(REPORT_FIELDS[key])).join(', ') || 'keine Bereiche'} · ${reportItemCount(report)} ${reportItemCount(report) === 1 ? 'Eintrag' : 'Einträge'}</p></header><p class="report-note">Quelle der Daten: persönliche Journaleinträge. Dieser bewusst unvollständige Auszug enthält nur die ausgewählten Bereiche und Einträge. Fehlende Angaben bedeuten keine Beschwerdefreiheit. Keine medizinische Bewertung.</p>${report.entries.some(entry => entry.checkin?.length) ? '<p class="report-note">Check-in-Skalen: Stimmung 1 = sehr belastet, 5 = sehr gut; Energie 1 = kaum, 5 = sehr viel. Schlafdauer in Stunden innerhalb der letzten 24 Stunden inklusive Nickerchen; überlappende Angaben werden nicht addiert. Beschwerdestärke: 0 = keine Beschwerden angegeben, 10 = maximal vorstellbar. Persönliche Merkhilfen, keine medizinischen Tests. Leere Felder sind fehlende Angaben.</p>' : ''}${report.entries.map(entry => `<article class="report-entry"><h2>${e(formatDate(entry.date))}${entry.time ? ` · ${e(entry.time)} Uhr` : ''}</h2>${entry.text ? `<h3>Notiz</h3><p class="report-text">${e(entry.text)}</p>` : ''}${entry.symptoms ? `<h3>Symptome</h3><p>${entry.symptoms.map(e).join(', ')}</p>` : ''}${entry.tags ? `<h3>Tags</h3><p>${entry.tags.map(value => `#${e(value)}`).join(' ')}</p>` : ''}${entry.checkin ? `<h3>Tages-Check-in</h3><ul>${entry.checkin.map(metric => `<li>${e(metric.label)}: ${e(number(metric.value))} ${e(metric.unit)}</li>`).join('')}</ul>` : ''}${entry.metrics ? `<h3>Weitere Messwerte</h3><ul>${entry.metrics.map(metric => `<li>${e(metric.label)}: ${e(number(metric.value))} ${e(metric.unit)}</li>`).join('')}</ul>` : ''}</article>`).join('')}${report.appointments?.length ? `<h2>Termine</h2>${report.appointments.map(item => `<article class="report-entry"><h3>${e(item.title)}</h3><p>${e(formatDate(item.date))} ${e(item.time)} · ${e(item.provider)} · ${e(item.location)}</p></article>`).join('')}` : ''}${report.careNotes?.length ? `<h2>Terminnotizen und Antworten</h2>${report.careNotes.map(item => `<article class="report-entry"><h3>${e(formatDate(item.date))} · ${item.kind === 'qa' ? 'Frage &amp; Antwort' : item.kind === 'result' ? 'Ergebnis / Befund' : 'Notiz'}</h3><p class="report-text">${e(item.text)}</p>${item.answer ? `<p class="report-text">Antwort: ${e(item.answer)}</p>` : ''}${item.nextSteps ? `<p class="report-text">Nächste Schritte: ${e(item.nextSteps)}</p>` : ''}<p>${item.discussed ? 'Besprochen' : 'Nicht als besprochen markiert'}</p>${item.appointment ? `<p>Termin: ${e(formatDate(item.appointment.date))} ${e(item.appointment.time)} · ${e(item.appointment.title)} · ${e(item.appointment.provider)} · ${e(item.appointment.location)}</p>` : ''}</article>`).join('')}` : ''}${reportItemCount(report) ? '' : '<p>Keine Einträge mit den ausgewählten Bereichen in diesem Zeitraum.</p>'}`;
}
export function reportDocument(report) {
  // Fully self-contained. No script, remote asset, raw snapshot, credentials or hidden excluded values.
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>Persönlicher Journalauszug</title><style>body{font:16px/1.65 system-ui,sans-serif;color:#283c33;max-width:760px;margin:35px auto;padding:0 20px}h1{font:32px Georgia,serif}h2{font:24px Georgia,serif}h3{font-size:16px;margin-bottom:4px}.report-note{background:#f1f3ed;padding:16px}.report-entry{border-top:1px solid #d9dfd3;padding:18px 0;break-inside:avoid}.report-text{white-space:pre-wrap;overflow-wrap:anywhere}p,li{overflow-wrap:anywhere}@media print{body{margin:0;max-width:none}}</style></head><body>${reportBody(report)}</body></html>`;
}
