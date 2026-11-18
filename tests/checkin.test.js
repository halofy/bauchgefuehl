import test from 'node:test';
import assert from 'node:assert/strict';
import { CHECKIN_FIELDS, checkinMetrics, readCheckin, upsertCheckin, summarizeCheckins, isCheckinMetric } from '../src/checkin.js';
import { normalizeEntry, normalizeJournal, isCheckinEntry, archiveEntry, filterEntries, journalCsv } from '../src/journal.js';
import { weeklySummary } from '../src/reflection.js';
import { snapshot } from '../src/sync.js';
import { importSnapshot, createIdentity, sealTransfer, openTransfer } from '../src/device-transfer.js';
import { readLocal, STORAGE_KEY } from '../src/pregnancy.js';
import { projectReport, reportDocument } from '../src/report.js';

const today = '2026-11-18';
const now = '2026-11-18T10:30:00.000Z';
const draft = { date: today, time: '11:30', text: '', symptoms: [], tags: [], metrics: [] };
const entry = (id, values, extra = {}) => normalizeEntry({ ...draft, id: `checkin-synthetic-${id}`, metrics: checkinMetrics(values), createdAt: now, updatedAt: now, ...extra }, today);
const memory = () => { const data = new Map(); return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) }; };

test('all check-in fields are optional and missing values never become zero or defaults', () => {
  assert.deepEqual(checkinMetrics({}), []);
  assert.deepEqual(checkinMetrics({ mood: '', sleep: ' ', energy: null }), []);
  const observation = entry('optional', { mood: 4 });
  assert.deepEqual(readCheckin(observation), { values: { mood: 4 }, invalid: [] });
  assert.throws(() => upsertCheckin([], draft, {}), /Bitte eine Notiz/);
  const [note] = upsertCheckin([], { ...draft, text: 'Synthetic note only' }, {});
  assert.ok(isCheckinEntry(note)); assert.deepEqual(readCheckin(note).values, {});
});
test('zero sleep and explicit zero complaints survive while ordinal scales have no zero', () => {
  const observation = entry('zero', { sleep: '0', intensity: '0', mood: '1', energy: '5' });
  assert.deepEqual(readCheckin(observation).values, { mood: 1, energy: 5, sleep: 0, intensity: 0 });
  assert.throws(() => checkinMetrics({ mood: 0 })); assert.throws(() => checkinMetrics({ energy: 0 }));
  assert.equal(readCheckin(entry('decimal', { sleep: '6,25' })).values.sleep, 6.25);
});
test('subjective scale bounds, integer categories and decimal sleep are validated before saving', () => {
  for (const values of [{ mood: 6 }, { mood: 2.5 }, { energy: -1 }, { intensity: 11 }, { intensity: 3.4 }, { sleep: 24.01 }, { sleep: -1 }, { sleep: 'NaN' }, { sleep: Infinity }, { mood: true }, { mood: [] }]) assert.throws(() => checkinMetrics(values));
  assert.equal(checkinMetrics({ sleep: 24, intensity: 10 }).length, 2);
});
test('ordinary journal text, tags and similarly named custom metrics never become structured check-ins', () => {
  const ordinary = entry('ordinary', { mood: 3 }, { id: 'ordinary-synthetic-entry', tags: ['Check-in'], text: 'Check-in: Stimmung 5' });
  assert.equal(readCheckin(ordinary), null); assert.equal(isCheckinMetric(ordinary, ordinary.metrics[0]), false);
  assert.equal(summarizeCheckins([ordinary]).count, 0);
  assert.equal(weeklySummary([ordinary], today, today).metrics[0].label, CHECKIN_FIELDS.mood.storedLabel);
});
test('multiple check-ins on the same day retain distinct IDs and editable timestamps', () => {
  let entries = upsertCheckin([], draft, { mood: 2 }, null, now);
  entries = upsertCheckin(entries, { ...draft, time: '20:00' }, { mood: 4 }, null, now);
  assert.equal(entries.length, 2); assert.notEqual(entries[0].id, entries[1].id);
  const previous = entries.find(item => item.time === '11:30');
  entries = upsertCheckin(entries, { ...draft, text: 'Synthetic updated note', metrics: [{ kind: 'weight', value: 65 }] }, { sleep: 7.5 }, previous, '2026-11-18T11:30:00.000Z');
  const changed = entries.find(item => item.id === previous.id);
  assert.equal(changed.createdAt, previous.createdAt); assert.equal(changed.updatedAt, '2026-11-18T11:30:00.000Z');
  assert.deepEqual(readCheckin(changed).values, { sleep: 7.5 }); assert.equal(changed.metrics.length, 2);
  assert.equal(filterEntries(entries, { type: 'checkin' }).length, 2);
});
test('unknown or damaged check-in values remain present but are not summarized as valid observations', () => {
  const invalid = entry('invalid', {}, { metrics: [
    { kind: 'custom', label: CHECKIN_FIELDS.mood.storedLabel, unit: '1–5', value: 9 },
    { kind: 'custom', label: CHECKIN_FIELDS.sleep.storedLabel, unit: 'min', value: 8 },
  ] });
  const original = JSON.stringify(invalid);
  assert.deepEqual(readCheckin(invalid), { values: {}, invalid: ['mood', 'sleep'] });
  const summary = summarizeCheckins([invalid]);
  assert.equal(summary.fields.find(item => item.key === 'mood').invalid, 1);
  assert.equal(summary.fields.find(item => item.key === 'mood').count, 0);
  assert.equal(JSON.stringify(invalid), original);
  assert.throws(() => upsertCheckin([invalid], { ...draft, metrics: invalid.metrics }, {}, invalid));
});
test('duplicate reserved fields with different units do not silently select one reading', () => {
  const observation = entry('duplicate', { sleep: 7 });
  observation.metrics.push({ kind: 'custom', label: CHECKIN_FIELDS.sleep.storedLabel, unit: 'min', value: 420 });
  assert.deepEqual(readCheckin(observation), { values: {}, invalid: ['sleep'] });
});
test('weekly check-in summaries distinguish observations, days, missing fields and chronological originals', () => {
  const entries = [
    entry('evening', { mood: 4, sleep: 7 }, { date: '2026-11-16', time: '20:00' }),
    entry('morning', { mood: 2, intensity: 0 }, { date: '2026-11-16', time: '08:00' }),
    entry('nextday', { energy: 3 }, { date: '2026-11-17' }),
    entry('today', {}, { text: 'Synthetic note' }),
  ];
  const summary = weeklySummary(entries, today, today);
  assert.equal(summary.checkins.count, 4); assert.equal(summary.checkins.dayCount, 3);
  assert.equal(summary.checkins.missingDays, 0); assert.equal(summary.checkins.futureDays, 4);
  const mood = summary.checkins.fields.find(item => item.key === 'mood');
  assert.equal(mood.first.value, 2); assert.equal(mood.last.value, 4); assert.equal(mood.count, 2); assert.equal(mood.dayCount, 1); assert.equal(mood.missing, 2);
  assert.equal(summary.checkins.fields.find(item => item.key === 'intensity').last.value, 0);
  assert.deepEqual(summary.metrics, []);
  const originals = filterEntries(entries, { from: summary.from, to: summary.to, type: 'checkin' });
  assert.equal(originals.length, 4); assert.ok(originals.some(item => item.id === mood.last.entryId));
});
test('archiving, restoring, date boundaries and future days update the same weekly source data', () => {
  const observation = entry('archived', { energy: 4 });
  const archived = archiveEntry([observation], observation.id, true, now);
  assert.equal(weeklySummary(archived, today, today).checkins.count, 0);
  assert.equal(weeklySummary(archived, today, today).checkins.missingDays, 3);
  const restored = archiveEntry(archived, observation.id, false, now);
  assert.equal(weeklySummary(restored, today, today).checkins.count, 1);
  const future = { ...observation, id: 'checkin-synthetic-future', date: '2026-11-19' };
  const outside = { ...observation, id: 'checkin-synthetic-outside', date: '2026-11-15' };
  assert.equal(weeklySummary([...restored, future, outside], today, today).checkins.count, 1);
  assert.equal(weeklySummary(restored, '2026-12-01', today).checkins.count, 0);
});
test('sleep observations describe individual rolling periods without sums or implicit daily averages', () => {
  const observations = [entry('sleep-1', { sleep: 6 }, { time: '08:00' }), entry('sleep-2', { sleep: 7 }, { time: '20:00' })];
  const summary = summarizeCheckins(observations).fields.find(item => item.key === 'sleep');
  assert.equal(summary.count, 2); assert.equal(summary.dayCount, 1); assert.equal(summary.first.value, 6); assert.equal(summary.last.value, 7);
  assert.ok(!Object.hasOwn(summary, 'sum')); assert.ok(!Object.hasOwn(summary, 'average'));
});
test('ordinary notes on other days do not close gaps in check-in coverage', () => {
  const checkin = entry('coverage', { mood: 3 });
  const note = entry('note', {}, { id: 'ordinary-synthetic-note', date: '2026-11-16', text: 'Synthetic note' });
  const summary = weeklySummary([checkin, note], today, today);
  assert.equal(summary.recordedDays, 2); assert.equal(summary.checkins.dayCount, 1);
  assert.equal(summary.checkins.missingDays, 2); assert.equal(summary.checkins.futureDays, 4);
});
test('check-ins use the existing v3 journal and survive local storage, backup import and encrypted device transfer', async () => {
  const journal = [entry('roundtrip', { mood: 3, energy: 4, sleep: 0, intensity: 0 }, { text: 'Synthetic transfer note', symptoms: ['Synthetic symptom'], tags: ['Synthetic tag'] })];
  const value = { schema: 3, profile: { method: 'period', lmp: '2026-07-09', cycle: 30 }, checks: {}, journal };
  const storage = memory(); importSnapshot(storage, value, { today });
  assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).v, 3);
  assert.deepEqual(readLocal(storage, today).journal, normalizeJournal(journal, today));
  assert.deepEqual(snapshot(value, today).journal, normalizeJournal(journal, today));
  const sealed = await sealTransfer(value, await createIdentity(), 'synthetic-checkin-password', { today });
  const packet = await openTransfer(sealed.envelope, 'synthetic-checkin-password', today);
  const second = memory(); importSnapshot(second, packet.data.snapshot, { today });
  assert.deepEqual(readCheckin(readLocal(second, today).journal[0]).values, { mood: 3, energy: 4, sleep: 0, intensity: 0 });
  assert.match(journalCsv(journal), /Check-in: Schlafdauer/);
});
test('sharing other measurements excludes structured check-in values from projection and the entire output file', () => {
  const observation = entry('report', { mood: 4, sleep: 6.25 }, { metrics: [...checkinMetrics({ mood: 4, sleep: 6.25 }), { kind: 'weight', value: 65 }] });
  const options = { from: today, to: today, fields: ['metrics'] };
  const report = projectReport([observation], options);
  assert.deepEqual(report.entries[0].metrics, [{ label: 'Gewicht', unit: 'kg', value: 65 }]);
  const content = JSON.stringify(report) + reportDocument(report);
  assert.ok(!content.includes('Check-in:')); assert.ok(!content.includes('6.25')); assert.ok(!content.includes(observation.id));
  const selected = projectReport([observation], { ...options, fields: ['checkin'] });
  assert.equal(selected.entries[0].checkin.length, 2); assert.ok(!selected.entries[0].metrics);
  assert.match(reportDocument(selected), /Check-in: Stimmung/); assert.ok(!reportDocument(selected).includes('Gewicht'));
  assert.deepEqual(projectReport([observation], { ...options, fields: ['checkin'], excluded: [observation.id] }).entries, []);
});
test('invalid or wrong-unit reserved values cannot leak through the other-measurements report category', () => {
  const observation = entry('private-invalid', {}, { metrics: [{ kind: 'custom', label: CHECKIN_FIELDS.sleep.storedLabel.toLocaleLowerCase('de'), unit: 'private-unit', value: 17 }] });
  const report = projectReport([observation], { from: today, to: today, fields: ['metrics', 'text'] });
  assert.deepEqual(report.entries, []); assert.ok(!reportDocument(report).includes('private-unit'));
});
test('check-in summaries and selective reports never mutate original entries', () => {
  const entries = [entry('immutable', { mood: 2, energy: 5 })]; const before = JSON.stringify(entries);
  weeklySummary(entries, today, today); projectReport(entries, { from: today, to: today, fields: ['checkin'] });
  assert.equal(JSON.stringify(entries), before);
});
