import { addDays, dayNumber } from './dates.js';
import { metricKey, symptomKey, isCheckinEntry } from './journal.js';
import { isCheckinMetric, summarizeCheckins } from './checkin.js';

export function calendarWeek(date) {
  const weekday = (new Date(dayNumber(date) * 86400000).getUTCDay() + 6) % 7;
  const from = addDays(date, -weekday);
  return { from, to: addDays(from, 6) };
}

export function symptomMentions(entries, symptom = '') {
  const key = symptomKey(symptom);
  return entries.filter(entry => !entry.deletedAt && (key ? entry.symptoms.some(label => symptomKey(label) === key) : entry.symptoms.length > 0)).length;
}

export function weeklySummary(entries, date, today) {
  const { from, to } = calendarWeek(date);
  dayNumber(today);
  const active = entries.filter(entry => !entry.deletedAt && entry.date >= from && entry.date <= to && entry.date <= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(from, index);
    const observations = active.filter(entry => entry.date === date);
    return { date, entries: observations, state: date > today ? 'future' : observations.length ? 'recorded' : 'missing' };
  });
  const symptoms = new Map();
  const metrics = new Map();
  for (const entry of active) {
    const seen = new Set();
    for (const label of entry.symptoms) {
      const key = symptomKey(label);
      if (seen.has(key)) continue;
      seen.add(key);
      if (!symptoms.has(key)) symptoms.set(key, { key, label, count: 0, dates: new Set(), entryIds: [] });
      const item = symptoms.get(key); item.count++; item.dates.add(entry.date); item.entryIds.push(entry.id);
    }
    for (const metric of entry.metrics) {
      if (isCheckinMetric(entry, metric)) continue;
      const key = metricKey(metric);
      const point = { date: entry.date, time: entry.time, value: metric.value, entryId: entry.id };
      if (!metrics.has(key)) metrics.set(key, { key, label: metric.label, unit: metric.unit, count: 0, first: point, last: point, min: metric.value, max: metric.value });
      const item = metrics.get(key); item.count++; item.last = point; item.min = Math.min(item.min, metric.value); item.max = Math.max(item.max, metric.value);
    }
  }
  const checkins = { ...summarizeCheckins(active), missingDays: days.filter(day => day.state !== 'future' && !day.entries.some(isCheckinEntry)).length, futureDays: days.filter(day => day.state === 'future').length };
  return {
    from, to, entries: active, days, checkins,
    recordedDays: days.filter(day => day.state === 'recorded').length,
    missingDays: days.filter(day => day.state === 'missing').length,
    futureDays: days.filter(day => day.state === 'future').length,
    symptoms: [...symptoms.values()].map(item => ({ ...item, dates: [...item.dates].sort(), dayCount: item.dates.size })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'de')),
    metrics: [...metrics.values()].sort((a, b) => a.label.localeCompare(b.label, 'de') || a.unit.localeCompare(b.unit)),
  };
}
