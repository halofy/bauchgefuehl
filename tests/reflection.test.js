import test from 'node:test';
import assert from 'node:assert/strict';
import { calendarWeek, symptomMentions, weeklySummary } from '../src/reflection.js';
import { normalizeEntry, archiveEntry, filterEntries, symptomOptions } from '../src/journal.js';
import { calendarReflectionPeriod } from '../src/calendar.js';

const today = '2026-11-17';
const entry = (extra = {}) => normalizeEntry({ id: 'synthetic-entry-0001', date: '2026-11-16', time: '09:00', text: 'Synthetischer Rückblick', symptoms: [], metrics: [], tags: [], createdAt: '2026-11-16T10:00:00.000Z', updatedAt: '2026-11-16T10:00:00.000Z', ...extra }, today);

test('week view counts observations within the displayed pregnancy week, even when it starts midweek', () => {
  const selected = '2026-11-13';
  const period = calendarReflectionPeriod({ start: '2026-08-05' }, selected);
  assert.deepEqual(period, { from: '2026-11-11', to: '2026-11-17', weekNumber: 15 });
  const entries = [
    entry({ date: '2026-11-10' }),
    entry({ date: '2026-11-11', id: 'synthetic-entry-0002' }),
    entry({ date: '2026-11-17', id: 'synthetic-entry-0003' }),
  ];
  const result = weeklySummary(entries, selected, today, period);
  assert.deepEqual(result.entries.map(item => item.date), ['2026-11-11', '2026-11-17']);
  assert.equal(result.recordedDays, 2);
});

test('week navigation has a shared boundary when switching from pregnancy to postpartum', () => {
  const timeline = { start: '2026-08-05' };
  const birth = '2026-11-13';
  assert.deepEqual(calendarReflectionPeriod(timeline, '2026-11-12', birth),
    { from: '2026-11-11', to: '2026-11-12', weekNumber: 15 });
  assert.deepEqual(calendarReflectionPeriod(timeline, birth, birth),
    { from: birth, to: '2026-11-15', weekNumber: null });
  assert.deepEqual(calendarReflectionPeriod(timeline, '2026-08-04'),
    { from: '2026-08-03', to: '2026-08-04', weekNumber: null });
  assert.deepEqual(calendarReflectionPeriod(timeline, '2027-05-26'),
    { from: '2027-05-26', to: '2027-05-30', weekNumber: null });
});

test('a selected date determines a Monday–Sunday calendar week including year and DST transitions', () => {
  assert.deepEqual(calendarWeek('2026-11-17'), { from: '2026-11-16', to: '2026-11-22' });
  assert.deepEqual(calendarWeek('2026-11-22'), calendarWeek('2026-11-16'));
  assert.deepEqual(calendarWeek('2027-01-01'), { from: '2026-12-28', to: '2027-01-03' });
  assert.deepEqual(calendarWeek('2026-03-29'), { from: '2026-03-23', to: '2026-03-29' });
  assert.throws(() => calendarWeek('2026-02-30'));
});

test('missing days and future days remain distinct from days with observations', () => {
  const summary = weeklySummary([entry()], today, today);
  assert.equal(summary.entries.length, 1); assert.equal(summary.recordedDays, 1); assert.equal(summary.missingDays, 1); assert.equal(summary.futureDays, 5);
  assert.deepEqual(summary.days.map(day => day.state), ['recorded', 'missing', 'future', 'future', 'future', 'future', 'future']);
});

test('an entry without symptom data is a journal observation, never an inferred symptom-free day', () => {
  const summary = weeklySummary([entry()], today, today);
  assert.equal(summary.days[0].state, 'recorded'); assert.deepEqual(summary.symptoms, []);
  assert.equal(symptomMentions(summary.entries), 0);
  assert.deepEqual(summary.metrics, []);
});

test('repeated symptom mentions count observations and unique days separately, ignoring case', () => {
  const entries = [
    entry({ symptoms: ['Müdigkeit', 'Übelkeit'] }),
    entry({ id: 'synthetic-entry-0002', time: '19:00', symptoms: ['müdigkeit'] }),
    entry({ id: 'synthetic-entry-0003', date: today, symptoms: ['MÜDIGKEIT'] }),
  ];
  const summary = weeklySummary(entries, today, today);
  const fatigue = summary.symptoms.find(item => item.key === 'müdigkeit');
  assert.equal(fatigue.count, 3); assert.equal(fatigue.dayCount, 2); assert.equal(fatigue.entryIds.length, 3);
  assert.deepEqual(fatigue.dates, ['2026-11-16', today]);
  assert.equal(summary.symptoms.find(item => item.key === 'übelkeit').count, 1);
  assert.equal(symptomMentions(entries), 3); assert.equal(symptomMentions(entries, 'ÜBELKEIT'), 1);
});

test('a symptom is counted at most once within each observation', () => {
  const duplicateLabels = { ...entry(), symptoms: ['Müdigkeit', 'müdigkeit'] };
  const summary = weeklySummary([duplicateLabels], today, today);
  assert.equal(summary.symptoms[0].count, 1); assert.equal(symptomMentions([duplicateLabels], 'Müdigkeit'), 1);
});

test('archive and restore consistently update symptom frequency, coverage and measurement summaries', () => {
  const entries = [entry({ symptoms: ['Müdigkeit'], metrics: [{ kind: 'weight', value: 65 }] })];
  const archived = archiveEntry(entries, entries[0].id, true, '2026-11-16T11:00:00.000Z');
  const summary = weeklySummary(archived, today, today);
  assert.equal(summary.recordedDays, 0); assert.deepEqual(summary.symptoms, []); assert.deepEqual(summary.metrics, []);
  assert.equal(symptomMentions(archived), 0); assert.deepEqual(symptomOptions(archived), []);
  const restored = archiveEntry(archived, entries[0].id, false, '2026-11-16T12:00:00.000Z');
  assert.equal(weeklySummary(restored, today, today).symptoms[0].count, 1);
  assert.equal(symptomOptions(archived, true).length, 1);
});

test('week boundaries include both endpoints and exclude adjacent observations', () => {
  const entries = [
    entry({ id: 'synthetic-entry-0001', date: '2026-11-01', symptoms: ['Davor'] }),
    entry({ id: 'synthetic-entry-0002', date: '2026-11-02', symptoms: ['Start'] }),
    entry({ id: 'synthetic-entry-0003', date: '2026-11-08', symptoms: ['Ende'] }),
    entry({ id: 'synthetic-entry-0004', date: '2026-11-09', symptoms: ['Danach'] }),
  ].map(item => ({ ...item }));
  const summary = weeklySummary(entries, '2026-11-03', today);
  assert.deepEqual(summary.entries.map(item => item.id), ['synthetic-entry-0002', 'synthetic-entry-0003']);
});

test('a future week has seven future days, no assumed observations and no missing historical data', () => {
  const summary = weeklySummary([entry()], '2026-12-01', today);
  assert.equal(summary.futureDays, 7); assert.equal(summary.missingDays, 0); assert.equal(summary.recordedDays, 0);
  assert.deepEqual(summary.symptoms, []); assert.deepEqual(summary.metrics, []);
});

test('measurements retain units and use the first and last chronological observation, including zero', () => {
  const entries = [
    entry({ id: 'synthetic-entry-0001', time: '19:00', metrics: [{ kind: 'weight', value: 65.5 }, { kind: 'custom', label: 'Schlafdauer', unit: 'h', value: 8 }] }),
    entry({ id: 'synthetic-entry-0002', time: '08:00', metrics: [{ kind: 'weight', value: 65 }, { kind: 'custom', label: 'Schlafdauer', unit: 'min', value: 420 }, { kind: 'custom', label: 'Eigene Skala', unit: '', value: 0 }] }),
  ];
  const summary = weeklySummary(entries, today, today);
  const weight = summary.metrics.find(item => item.label === 'Gewicht');
  assert.equal(weight.count, 2); assert.equal(weight.first.value, 65); assert.equal(weight.last.value, 65.5); assert.equal(weight.min, 65); assert.equal(weight.max, 65.5);
  assert.equal(summary.metrics.filter(item => item.label === 'Schlafdauer').length, 2);
  assert.equal(summary.metrics.find(item => item.label === 'Eigene Skala').last.value, 0);
});

test('symptom drilldown returns the exact source observations without matching notes or other symptoms', () => {
  const entries = [
    entry({ id: 'synthetic-entry-0001', symptoms: ['Übelkeit'] }),
    entry({ id: 'synthetic-entry-0002', symptoms: ['übelkeit'], date: today }),
    entry({ id: 'synthetic-entry-0003', text: 'Übelkeit steht hier nur als synthetischer Text.', symptoms: ['Andere Bezeichnung'] }),
    entry({ id: 'synthetic-entry-0004', symptoms: ['Übelkeit morgens'] }),
  ];
  const summary = weeklySummary(entries, today, today);
  const symptom = summary.symptoms.find(item => item.key === 'übelkeit');
  const filtered = filterEntries(entries, { from: summary.from, to: summary.to, symptom: symptom.key });
  assert.deepEqual(filtered.map(item => item.id).sort(), [...symptom.entryIds].sort());
  assert.equal(filterEntries(entries, { symptom: 'ÜBELKEIT', tag: 'unknown' }).length, 0);
});

test('symptom choices deduplicate case, support custom labels and never derive symptoms from prose', () => {
  const entries = [entry({ symptoms: ['Mein Symptom', 'Übelkeit'] }), entry({ id: 'synthetic-entry-0002', symptoms: ['mein symptom'], text: 'Müdigkeit ist hier nur Text.' })];
  assert.deepEqual(symptomOptions(entries).map(item => item.key), ['mein symptom', 'übelkeit']);
  assert.equal(symptomMentions(entries, 'Müdigkeit'), 0);
});

test('reflection reads do not mutate journal observations or their metric data', () => {
  const entries = [entry({ symptoms: ['Müdigkeit'], metrics: [{ kind: 'weight', value: 65 }] }), entry({ id: 'synthetic-entry-0002', date: today })];
  const before = JSON.stringify(entries);
  weeklySummary(entries, today, today); symptomOptions(entries); symptomMentions(entries);
  assert.equal(JSON.stringify(entries), before);
});
