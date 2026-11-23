import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLabels, parseMeasurement, formatMeasurementInput, normalizeMetric, normalizeEntry, normalizeJournal, upsertEntry, archiveEntry, assertJournalContinuity, filterEntries, metricKey, metricSeries, journalCsv } from '../src/journal.js';
import { writeLocal, readLocal, STORAGE_KEY, HISTORY_KEY, encodeShare, decodeShare } from '../src/pregnancy.js';
import { snapshot } from '../src/sync.js';

const today = '2026-11-17';
const profile = { method: 'period', lmp: '2026-07-09', cycle: 30, irregular: false };
const stamp = '2026-11-16T10:00:00.000Z';
const entry = (extra = {}) => normalizeEntry({ id: 'synthetic-0001', date: '2026-11-16', time: '10:00', text: 'Synthetische Testnotiz', symptoms: ['Müdigkeit'], tags: ['Test'], metrics: [{ kind: 'weight', value: 65.5 }], createdAt: stamp, updatedAt: stamp, ...extra }, today);
function memory() {
  const map = new Map();
  return { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) };
}

test('symptoms and tags accept free labels and normalize hashes and duplicates', () => {
  assert.deepEqual(parseLabels(' #Test, test, Übelkeit, , #Zuhause '), ['Test', 'Übelkeit', 'Zuhause']);
  assert.deepEqual(entry({ tags: ['#Test', 'test'] }).tags, ['Test']);
  assert.throws(() => entry({ tags: Array.from({ length: 21 }, (_, i) => `tag${i}`) }), /20/);
  assert.throws(() => entry({ tags: Array.from({ length: 20 }, (_, i) => `${i},x${i}`) }), /20/);
});

test('measurements accept decimal commas and dots, including custom units', () => {
  assert.equal(parseMeasurement(' 65,5 '), 65.5);
  assert.equal(parseMeasurement('0.75'), .75);
  assert.equal(formatMeasurementInput(1234.56789), '1234,56789');
  for (const value of [0, 65.55, 0.000000123, 1234.56789]) assert.equal(parseMeasurement(formatMeasurementInput(value)), value);
  assert.equal(normalizeMetric({ kind: 'weight', value: 65, unit: 'lb', label: 'fremd' }).unit, 'kg');
  assert.deepEqual(normalizeMetric({ kind: 'custom', value: -2, label: 'Differenz', unit: 'cm' }), { kind: 'custom', value: -2, label: 'Differenz', unit: 'cm' });
  for (const value of ['', '1,2,3', '65kg', 'NaN', 'Infinity', '1e9', '1000001']) assert.throws(() => parseMeasurement(value));
  assert.throws(() => normalizeMetric({ kind: 'belly', value: -1 }));
  assert.throws(() => normalizeMetric({ kind: 'custom', value: 1, label: '', unit: 'h' }));
});

test('journal rejects invalid dates, empty entries and repeated measurement kinds', () => {
  for (const extra of [{ date: '2026-02-30' }, { date: '2026-11-18' }, { time: '24:00' }, { updatedAt: '2026-11-15T10:00:00.000Z' }, { text: 'x'.repeat(4001) }, { metrics: [{ kind: 'weight', value: 65 }, { kind: 'weight', value: 66 }] }, { text: '', symptoms: [], tags: [], metrics: [] }]) assert.throws(() => entry(extra));
  assert.throws(() => normalizeJournal([entry(), entry()], today), /doppelte/);
});

test('editing preserves identity and original time; archiving and restoring retain content', () => {
  const original = entry();
  const updated = upsertEntry([original], { ...original, text: 'Synthetische Änderung' }, original, '2026-11-16T11:00:00.000Z');
  assert.equal(updated.length, 1); assert.equal(updated[0].id, original.id); assert.equal(updated[0].createdAt, stamp);
  const archived = archiveEntry(updated, original.id, true, '2026-11-16T12:00:00.000Z');
  assert.equal(filterEntries(archived).length, 0);
  assert.equal(filterEntries(archived, { archived: true }).length, 1);
  const restored = archiveEntry(archived, original.id, false, '2026-11-16T13:00:00.000Z');
  assert.equal(restored[0].text, updated[0].text); assert.equal(restored[0].deletedAt, null);
  assert.doesNotThrow(() => assertJournalContinuity(archived, updated));
  assert.throws(() => assertJournalContinuity([], updated), /verlieren/);
});

test('search combines symptoms, text, tags, dates and measurement labels', () => {
  const entries = [entry(), entry({ id: 'synthetic-0002', date: '2026-11-15', text: 'Andere Testnotiz', tags: ['Arbeit'], symptoms: [], metrics: [] })];
  assert.equal(filterEntries(entries, { search: 'MÜDIGKEIT' }).length, 1);
  assert.equal(filterEntries(entries, { search: 'gewicht', tag: 'Test', from: '2026-11-16', to: '2026-11-16' }).length, 1);
  assert.equal(filterEntries(entries, { search: 'Testnotiz', tag: 'Arbeit' })[0].id, 'synthetic-0002');
  assert.equal(filterEntries(entries, { from: '2026-11-17' }).length, 0);
});

test('metric series are chronological, omit archived entries and never mix custom units', () => {
  const a = entry({ date: '2026-11-14', metrics: [{ kind: 'custom', label: 'Schlaf', unit: 'h', value: 8 }] });
  const b = entry({ id: 'synthetic-0002', metrics: [{ kind: 'custom', label: 'Schlaf', unit: 'min', value: 480 }] });
  const c = entry({ id: 'synthetic-0003', date: '2026-11-15', metrics: [{ kind: 'custom', label: 'Schlaf', unit: 'h', value: 7 }] });
  const key = metricKey(a.metrics[0]);
  assert.deepEqual(metricSeries([b, c, a], key).map(p => p.value), [8, 7]);
  assert.equal(metricSeries(archiveEntry([a, b, c], a.id, true, stamp), key).length, 1);
});

test('CSV exports notes, labels and decimal commas while escaping spreadsheet formulae', () => {
  const csv = journalCsv([entry({ text: '=1+1; "Test"\nzweite Zeile', tags: ['@test'] })]);
  assert.ok(csv.startsWith('\ufeff')); assert.match(csv, /Gewicht \(kg\)/); assert.match(csv, /"65,5"/);
  assert.match(csv, /"'=1\+1; ""Test""\nzweite Zeile"/); assert.match(csv, /"'@test"/);
});

test('local v3 records preserve journal when editing calculation and checklist with legacy call signatures', () => {
  const storage = memory();
  writeLocal(storage, profile, {}, today, [entry()]);
  writeLocal(storage, { ...profile, cycle: 31 }, { 'scan-1': true }, today);
  const loaded = readLocal(storage, today);
  assert.deepEqual(loaded.journal, [entry()]); assert.equal(loaded.profile.cycle, 31); assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).v, 3);
  assert.deepEqual(JSON.parse(JSON.parse(storage.getItem(HISTORY_KEY))[0].raw).journal, [entry()]);
});

test('old v2 records migrate with an empty journal; an expired calculation keeps journal readable', () => {
  const storage = memory(); storage.setItem(STORAGE_KEY, JSON.stringify({ v: 2, profile, checks: {} }));
  assert.deepEqual(readLocal(storage, today).journal, []);
  writeLocal(storage, profile, {}, today, [entry()]);
  const expired = readLocal(storage, '2028-01-01');
  assert.equal(expired.profile, null); assert.deepEqual(expired.journal, [entry()]); assert.match(expired.error, /Journal/);
});

test('silent removal and storage failures leave the previous journal untouched', () => {
  const storage = memory(); writeLocal(storage, profile, {}, today, [entry()]);
  const before = storage.getItem(STORAGE_KEY);
  assert.throws(() => writeLocal(storage, profile, {}, today, []), /verlieren/); assert.equal(storage.getItem(STORAGE_KEY), before);
  const base = storage.setItem; storage.setItem = (key, value) => { if (key === HISTORY_KEY) throw new Error('Quota'); base(key, value); };
  assert.throws(() => writeLocal(storage, profile, {}, today, [entry({ text: 'Änderung' })]), /Quota/);
  assert.equal(storage.getItem(STORAGE_KEY), before);
});

test('explicit replacement archives the complete previous journal first', () => {
  const storage = memory(); writeLocal(storage, profile, {}, today, [entry()]);
  writeLocal(storage, profile, {}, today, [], { replaceJournal: true });
  assert.deepEqual(readLocal(storage, today).journal, []);
  assert.deepEqual(JSON.parse(JSON.parse(storage.getItem(HISTORY_KEY))[0].raw).journal, [entry()]);
});

test('journal limits fail explicitly without truncating a saved record', () => {
  const storage = memory(); writeLocal(storage, profile, {}, today, [entry()]); const before = storage.getItem(STORAGE_KEY);
  const large = Array.from({ length: 150 }, (_, i) => entry({ id: `synthetic-${String(i).padStart(4, '0')}`, text: 'x'.repeat(4000) }));
  assert.throws(() => snapshot({ profile, checks: {}, journal: large }, today), /512 KiB/);
  assert.throws(() => writeLocal(storage, profile, {}, today, large), /512 KiB/); assert.equal(storage.getItem(STORAGE_KEY), before);
  assert.throws(() => normalizeJournal(Array(1001).fill(entry()), today), /1.000/);
});

test('snapshot migration requires a journal in new format; simple share links exclude personal entries', () => {
  assert.deepEqual(snapshot({ profile, checks: {} }, today).journal, []);
  assert.throws(() => snapshot({ schema: 3, profile, checks: {} }, today), /fehlt/);
  assert.throws(() => snapshot({ schema: 4, profile }, today), /neuere/);
  const personal = { ...profile, journal: [entry()] };
  assert.deepEqual(decodeShare(`#s=${encodeShare(personal, today)}`, today), profile);
});
