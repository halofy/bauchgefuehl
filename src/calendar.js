import { calculatePregnancy } from './pregnancy.js';
import { addDays, dayNumber } from './dates.js';
import { milestones } from './content.js';

export function pregnancyTimeline(profile, today) {
  const current = calculatePregnancy(profile, today);
  const start = addDays(today, -current.gestationalDays);
  return { start, dueDate: current.dueDate, method: current.method };
}

export function gestationOnDate(timeline, date) {
  const age = dayNumber(date) - dayNumber(timeline.start);
  return { age, weeks: Math.floor(age / 7), days: ((age % 7) + 7) % 7, weekNumber: Math.floor(age / 7) + 1, status: age < 0 ? 'before' : age >= 294 ? 'beyond' : 'ongoing' };
}

export function dateForSsw(timeline, value) {
  const match = /^(\d{1,2})\+([0-6])$/.exec(value.trim());
  if (!match || Number(match[1]) > 42) throw new Error('Bitte volle Wochen + Tage eingeben, zum Beispiel 24+0 (0+0 bis 42+6).');
  return addDays(timeline.start, Number(match[1]) * 7 + Number(match[2]));
}

export function monthStart(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}$/.test(value) || value < '1900-01' || value > '2200-12') throw new Error('Bitte einen Monat zwischen 1900 und 2200 auswählen.');
  dayNumber(value + '-01');
  return value + '-01';
}

export function shiftMonth(month, offset) {
  const date = new Date(dayNumber(monthStart(month)) * 86400000);
  date.setUTCMonth(date.getUTCMonth() + offset);
  const result = date.toISOString().slice(0, 7);
  monthStart(result);
  return result;
}

export function monthDays(month) {
  const first = monthStart(month);
  const weekday = new Date(dayNumber(first) * 86400000).getUTCDay();
  const start = addDays(first, -((weekday + 6) % 7));
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export function timelineEvents(timeline) {
  const care = milestones.map(item => ({ ...item, type: 'care', date: addDays(timeline.start, item.start), endDate: addDays(timeline.start, Math.min(item.end, 293)), openEnded: item.label.startsWith('Ab ') }));
  const points = [
    { id: 'trimester-2', start: 98, title: 'Beginn des 2. Trimesters', text: '14+0 nach der Darstellungskonvention dieser App.' },
    { id: 'halfway', start: 140, title: 'Rechnerische Halbzeit', text: '20+0 · die Hälfte der rechnerischen 40 Wochen.' },
    { id: 'trimester-3', start: 196, title: 'Beginn des 3. Trimesters', text: '28+0 nach der Darstellungskonvention dieser App.' },
    { id: 'due-date', start: 280, title: 'Voraussichtlicher Geburtstermin', text: '40+0 · ein rechnerischer Termin, keine Vorhersage des Geburtstags.' },
  ].map(item => ({ ...item, type: 'point', date: addDays(timeline.start, item.start), endDate: addDays(timeline.start, item.start) }));
  return [...care, ...points].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

export function eventsOnDate(events, date) {
  dayNumber(date);
  return events.filter(event => event.date <= date && event.endDate >= date);
}

export function entriesOnDate(entries, date) {
  return entries.filter(entry => !entry.deletedAt && entry.date === date).sort((a, b) => a.time.localeCompare(b.time) || a.createdAt.localeCompare(b.createdAt));
}

export function upcomingEvents(events, from, limit = 6) {
  dayNumber(from);
  return events.filter(event => event.endDate >= from).sort((a, b) => (a.date < from ? from : a.date).localeCompare(b.date < from ? from : b.date) || a.date.localeCompare(b.date)).slice(0, limit);
}

export function weekRanges(timeline) {
  return Array.from({ length: 42 }, (_, index) => ({ weekNumber: index + 1, ssw: `${index}+0–${index}+6`, date: addDays(timeline.start, index * 7), endDate: addDays(timeline.start, index * 7 + 6) }));
}
