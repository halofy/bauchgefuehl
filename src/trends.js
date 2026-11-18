import { metricSeries } from './journal.js';
export function personalTrend(entries, key, { from = '', to = '', baseline = '', referenceEntries = entries } = {}) {
  const points = metricSeries(entries.filter(e => !e.deletedAt && (!from || e.date >= from) && (!to || e.date <= to)), key);
  const all = metricSeries(referenceEntries.filter(e => !e.deletedAt), key);
  const reference = all.find(p => p.id === baseline) || points[0] || null;
  return { points, reference, difference: points.length && reference ? points.at(-1).value - reference.value : null, annotations: entries.filter(e => !e.deletedAt && e.text && (!from || e.date >= from) && (!to || e.date <= to)).map(e => ({ id: e.id, date: e.date, text: e.text })) };
}
export function todayFocus(care, today, nowTime = '') {
  const appointments = care.appointments.filter(a => !a.deletedAt && (a.date > today || (a.date === today && (!a.time || a.time >= nowTime)))).sort((a,b) => a.date.localeCompare(b.date) || (a.time || '23:59').localeCompare(b.time || '23:59'));
  return { appointment: appointments[0] || null, questions: care.notes.filter(n => !n.deletedAt && n.kind === 'qa' && !n.discussed), steps: care.notes.filter(n => !n.deletedAt && n.nextSteps).sort((a,b) => b.date.localeCompare(a.date)).slice(0,3) };
}
