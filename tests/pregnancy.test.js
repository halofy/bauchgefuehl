import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { STORAGE_KEY, todayISO, dayNumber, addDays, calculatePregnancy, validateProfile, demoProfile, encodeShare, decodeShare, readLocal, writeLocal } from '../src/pregnancy.js';
import { getWeekContent, milestones } from '../src/content.js';

const profile = { method: 'period', lmp: '2026-07-09', cycle: 30, irregular: false };
const now = '2026-11-17';
const memory = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
};

test('30-day cycle: LMP 9 July gives 18+3 on 17 November, independent of a due-date input', () => {
  const result = calculatePregnancy(profile, now);
  assert.equal(result.elapsedDays, 131);
  assert.equal(result.gestationalDays, 129);
  assert.equal(result.weeks, 18);
  assert.equal(result.days, 3);
  assert.equal(result.weekNumber, 19);
  assert.equal(result.dueDate, '2027-04-17');
  assert.equal(result.daysUntilDue, 151);
  assert.equal(result.calendarWeeks, 18);
  assert.equal(result.calendarDays, 5);
  assert.deepEqual(calculatePregnancy({ ...profile, dueDate: '2099-01-01' }, now), result);
});

test('long cycles decrease the estimate; short cycles increase it', () => {
  const standard = calculatePregnancy({ ...profile, cycle: 28 }, now);
  const longer = calculatePregnancy({ ...profile, cycle: 35 }, now);
  const shorter = calculatePregnancy({ ...profile, cycle: 21 }, now);
  assert.equal(standard.gestationalDays, 131);
  assert.equal(longer.gestationalDays, 124);
  assert.equal(shorter.gestationalDays, 138);
  assert.equal(longer.dueDate, addDays(standard.dueDate, 7));
  assert.equal(shorter.dueDate, addDays(standard.dueDate, -7));
});

test('day before week boundary, at boundary, and at ET use completed weeks correctly', () => {
  assert.equal(calculatePregnancy({ lmp: '2026-11-04', cycle: 28 }, now).weekNumber, 2);
  const atBoundary = calculatePregnancy({ lmp: '2026-11-03', cycle: 28 }, now);
  assert.equal(atBoundary.weeks, 2);
  assert.equal(atBoundary.days, 0);
  assert.equal(atBoundary.weekNumber, 3);
  const due = calculatePregnancy({ lmp: '2026-02-10', cycle: 28 }, now);
  assert.equal(due.weeks, 40);
  assert.equal(due.days, 0);
  assert.equal(due.daysUntilDue, 0);
  assert.equal(due.progress, 100);
});

test('trimester boundaries are explicitly 14+0 and 28+0', () => {
  const at = days => calculatePregnancy({ lmp: addDays(now, -days), cycle: 28 }, now).trimester;
  assert.equal(at(97), 1);
  assert.equal(at(98), 2);
  assert.equal(at(195), 2);
  assert.equal(at(196), 3);
});

test('early negative estimates are preserved and labelled, not falsely clamped to 0+0', () => {
  const result = calculatePregnancy({ lmp: now, cycle: 35 }, now);
  assert.equal(result.gestationalDays, -7);
  assert.equal(result.status, 'before');
  assert.equal(result.progress, 0);
});

test('past ET and outside content range stay distinct', () => {
  const at = days => calculatePregnancy({ lmp: addDays(now, -days), cycle: 28 }, now);
  assert.equal(at(281).daysUntilDue, -1);
  assert.equal(at(293).status, 'ongoing');
  assert.equal(at(294).status, 'beyond');
  assert.equal(at(294).weekNumber, 43);
  assert.equal(at(320).progress, 100);
});

test('uncertainty is flagged for irregular and unusually short or long cycles', () => {
  assert.equal(calculatePregnancy(profile, now).uncertain, false);
  assert.equal(calculatePregnancy({ ...profile, irregular: true }, now).uncertain, true);
  assert.equal(calculatePregnancy({ ...profile, cycle: 20 }, now).uncertain, true);
  assert.equal(calculatePregnancy({ ...profile, cycle: 36 }, now).uncertain, true);
});

test('invalid civil dates, leap dates, future dates and old records are rejected', () => {
  assert.throws(() => dayNumber('2026-02-29'));
  assert.throws(() => dayNumber('2026-04-31'));
  assert.throws(() => dayNumber('2026-13-01'));
  assert.throws(() => dayNumber('2026-7-09'));
  assert.equal(addDays('2024-02-28', 1), '2024-02-29');
  assert.equal(addDays('2024-02-28', 2), '2024-03-01');
  assert.throws(() => validateProfile({ ...profile, lmp: '2026-11-18' }, now), /Zukunft/);
  assert.throws(() => validateProfile({ ...profile, lmp: '2025-11-15' }, now), /Jahr/);
  assert.doesNotThrow(() => validateProfile({ ...profile, lmp: addDays(now, -366) }, now));
});

test('cycle input must be a finite whole-day average in the supported range', () => {
  for (const cycle of [0, 14, 61, 28.5, '30', null, undefined, NaN, Infinity]) {
    assert.throws(() => validateProfile({ ...profile, cycle }, now));
  }
  for (const cycle of [15, 21, 28, 35, 60]) assert.doesNotThrow(() => validateProfile({ ...profile, cycle }, now));
  assert.throws(() => validateProfile({ ...profile, irregular: 'true' }, now));
});

test('calendar arithmetic is stable across DST, leap years and time zones', () => {
  for (const timezone of ['Europe/Berlin', 'America/New_York', 'Pacific/Auckland', 'Asia/Tokyo']) {
    const script = `import { dayNumber, calculatePregnancy } from './src/pregnancy.js'; console.log(JSON.stringify([dayNumber('2026-03-30')-dayNumber('2026-03-28'),dayNumber('2026-10-26')-dayNumber('2026-10-24'),calculatePregnancy(${JSON.stringify(profile)},'${now}').gestationalDays]));`;
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], { cwd: new URL('..', import.meta.url), env: { ...process.env, TZ: timezone }, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), [2, 2, 129]);
  }
});

test('today is the browser-local calendar day, not the UTC day', () => {
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', "import { todayISO } from './src/pregnancy.js'; console.log(todayISO(new Date('2026-11-17T23:30:00Z')));"], { cwd: new URL('..', import.meta.url), env: { ...process.env, TZ: 'Europe/Berlin' }, encoding: 'utf8' });
  assert.equal(result.stdout.trim(), '2026-11-18');
  assert.match(todayISO(), /^\d{4}-\d{2}-\d{2}$/);
});

test('rolling demo always shows clearly usable example 18+3, including leap day', () => {
  for (const date of [now, '2024-02-29', '2027-01-01']) {
    const result = calculatePregnancy(demoProfile(date), date);
    assert.equal(result.weeks, 18);
    assert.equal(result.days, 3);
  }
});

test('share round-trip contains only minimal pregnancy data, never private checkmarks', () => {
  const encoded = encodeShare({ ...profile, checks: { private: true }, name: 'Private' }, now);
  assert.match(encoded, /^[a-zA-Z0-9_-]+$/);
  const decoded = decodeShare(`#s=${encoded}`, now);
  assert.deepEqual(decoded, profile);
  const payload = JSON.parse(atob(encoded.replaceAll('-', '+').replaceAll('_', '/')));
  assert.deepEqual(Object.keys(payload).sort(), ['c', 'i', 'm', 'p', 'v']);
  assert.equal(payload.v, 2);
  assert.equal(payload.m, 'period');
  assert.equal(decodeShare('#wissen', now), null);
});

test('shared SSW advances each day from the original period, not a frozen due date', () => {
  const encoded = encodeShare(profile, now);
  const tomorrow = addDays(now, 1);
  const result = calculatePregnancy(decodeShare(`#s=${encoded}`, tomorrow), tomorrow);
  assert.equal(result.gestationalDays, 130);
  assert.equal(result.dueDate, '2027-04-17');
});

test('malformed, overlong, unsupported and hostile links are safely rejected', () => {
  for (const hash of ['#s=', '#s=%3Cscript%3E', '#s=' + 'A'.repeat(1025), '#s=bm90LWpzb24']) assert.throws(() => decodeShare(hash, now));
  const link = data => '#s=' + btoa(JSON.stringify(data)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
  for (const payload of [null, [], { v: 2, p: profile.lmp, c: 30, i: 0 }, { v: 1, p: '<script>', c: 30, i: 0 }, { v: 1, p: profile.lmp, c: '30', i: 0 }, { v: 1, p: profile.lmp, c: 30, i: true }]) assert.throws(() => decodeShare(link(payload), now));
  assert.throws(() => decodeShare(link({ v: 1, p: '2025-01-01', c: 30, i: 0 }), now));
});

test('local persistence round-trips profile and checklist', () => {
  const storage = memory();
  assert.deepEqual(readLocal(storage, now), { profile: null, checks: {}, journal: [], error: null });
  writeLocal(storage, profile, { 'scan-1': true }, now);
  assert.deepEqual(readLocal(storage, now), { profile, checks: { 'scan-1': true }, journal: [], error: null });
  storage.removeItem(STORAGE_KEY);
  assert.equal(readLocal(storage, now).profile, null);
});

test('corrupt, unsupported, expired and inaccessible local storage never crashes', () => {
  const storage = memory();
  for (const raw of ['{', 'null', '{"v":2}', JSON.stringify({ v: 1, profile: { ...profile, lmp: '2023-01-01' } })]) {
    storage.setItem(STORAGE_KEY, raw);
    const result = readLocal(storage, now);
    assert.equal(result.profile, null);
    assert.ok(result.error);
  }
  const broken = { getItem() { throw new Error('Blocked'); } };
  assert.ok(readLocal(broken, now).error);
  assert.throws(() => writeLocal({ setItem() { throw new Error('Quota'); } }, profile, {}, now), /Quota/);
});

test('untrusted checklist payloads are reduced to boolean values with safe identifiers', () => {
  const storage = memory();
  storage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, profile, checks: { 'scan-1': true, '<script>': true, 'scan-2': 'yes', 'scan-3': false } }));
  assert.deepEqual(readLocal(storage, now).checks, { 'scan-1': true });
});

test('all 42 ordinal weeks have phase-specific content and primary source attribution', () => {
  for (let week = 1; week <= 42; week++) {
    const content = getWeekContent(week);
    assert.ok(content.baby.length > 40);
    assert.ok(content.body.length > 40);
    assert.ok(content.start <= week && content.end >= week);
    assert.match(content.source, /^https:\/\/(www\.familienplanung\.de|www\.nhs\.uk)\//);
  }
  assert.throws(() => getWeekContent(0), RangeError);
  assert.throws(() => getWeekContent(43), RangeError);
  assert.equal(getWeekContent(calculatePregnancy(profile, now).weekNumber).start, 17);
});

test('German screening windows match completed weeks and days, avoiding ordinal off-by-one', () => {
  const window = id => { const item = milestones.find(x => x.id === id); return [item.start, item.end]; };
  assert.deepEqual(window('scan-1'), [8 * 7, 11 * 7 + 6]);
  assert.deepEqual(window('scan-2'), [18 * 7, 21 * 7 + 6]);
  assert.deepEqual(window('diabetes'), [24 * 7, 27 * 7 + 6]);
  assert.deepEqual(window('scan-3'), [28 * 7, 31 * 7 + 6]);
});

const dueProfile = { method: 'due-date', dueDate: '2027-04-17' };
const makeLink = data => '#s=' + btoa(JSON.stringify(data)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');

test('ET method reproduces 18+3 with the same ET and ignores all inactive period inputs', () => {
  const result = calculatePregnancy(dueProfile, now);
  const period = calculatePregnancy(profile, now);
  for (const field of ['gestationalDays', 'weeks', 'days', 'weekNumber', 'trimester', 'progress', 'dueDate', 'daysUntilDue']) {
    assert.equal(result[field], period[field], field);
  }
  assert.equal(result.method, 'due-date');
  assert.equal(result.correction, 0);
  assert.equal(result.uncertain, false);
  const mixed = { ...dueProfile, lmp: 'invalid', cycle: 0, irregular: true };
  assert.deepEqual(calculatePregnancy(mixed, now), result);
  assert.deepEqual(validateProfile(mixed, now), dueProfile);
});

test('ET is exactly 40+0, with correct day and week changes on either side', () => {
  const at = date => calculatePregnancy({ method: 'due-date', dueDate: date }, now);
  assert.equal(at(now).weeks, 40);
  assert.equal(at(now).days, 0);
  assert.equal(at(addDays(now, 1)).weeks, 39);
  assert.equal(at(addDays(now, 1)).days, 6);
  assert.equal(at(addDays(now, -1)).weeks, 40);
  assert.equal(at(addDays(now, -1)).days, 1);
  assert.equal(at(addDays(now, -14)).status, 'beyond');
  assert.equal(at(addDays(now, 280)).gestationalDays, 0);
});

test('ET validation rejects invalid or implausible dates and unknown methods', () => {
  for (const dueDate of ['', '2027-02-29', 'not-a-date', addDays(now, 281), addDays(now, -87)]) {
    assert.throws(() => validateProfile({ method: 'due-date', dueDate }, now));
  }
  assert.doesNotThrow(() => validateProfile({ method: 'due-date', dueDate: addDays(now, -86) }, now));
  for (const method of ['unknown', '', null, true]) assert.throws(() => validateProfile({ ...profile, method }, now), /Berechnungsmethode/);
});

test('ET shares contain only ET and method, with no inactive period, cycle or checklist', () => {
  const encoded = encodeShare({ ...dueProfile, lmp: profile.lmp, cycle: 30, checks: { 'scan-1': true } }, now);
  assert.deepEqual(JSON.parse(atob(encoded.replaceAll('-', '+').replaceAll('_', '/'))), { v: 2, m: 'due-date', d: dueProfile.dueDate });
  assert.deepEqual(decodeShare(`#s=${encoded}`, now), dueProfile);
  const tomorrow = addDays(now, 1);
  assert.equal(calculatePregnancy(decodeShare(`#s=${encoded}`, tomorrow), tomorrow).gestationalDays, 130);
});

test('existing v1 links retain the period method and never infer a new method', () => {
  const oldLink = makeLink({ v: 1, p: profile.lmp, c: 30, i: 0 });
  assert.deepEqual(decodeShare(oldLink, now), profile);
  assert.deepEqual(decodeShare(makeLink({ v: 1, p: profile.lmp, c: 30, i: 0, m: 'due-date', d: dueProfile.dueDate }), now), profile);
});

test('existing v1 local profiles preserve dates and checks, and upgrade on explicit save', () => {
  const storage = memory();
  const legacy = { lmp: profile.lmp, cycle: 30, irregular: false };
  const raw = JSON.stringify({ v: 1, profile: legacy, checks: { 'scan-1': true } });
  storage.setItem(STORAGE_KEY, raw);
  const loaded = readLocal(storage, now);
  assert.deepEqual(loaded, { profile, checks: { 'scan-1': true }, journal: [], error: null });
  assert.equal(storage.getItem(STORAGE_KEY), raw, 'Reading must not mutate existing data');
  writeLocal(storage, loaded.profile, loaded.checks, now);
  assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).v, 3);
  assert.deepEqual(readLocal(storage, now), loaded);
});

test('ET method and checklist survive local persistence without keeping inactive inputs', () => {
  const storage = memory();
  writeLocal(storage, { ...dueProfile, lmp: profile.lmp, cycle: 30 }, { 'scan-1': true }, now);
  assert.deepEqual(readLocal(storage, now), { profile: dueProfile, checks: { 'scan-1': true }, journal: [], error: null });
  assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEY)).profile, dueProfile);
});

test('v2 links and local records require a recognized method and its valid inputs', () => {
  for (const payload of [{ v: 2, m: 'unknown', p: profile.lmp, c: 30, i: 0 }, { v: 2, m: 'due-date', p: profile.lmp, c: 30, i: 0 }, { v: 2, m: 'period', d: dueProfile.dueDate }, { v: 3, m: 'due-date', d: dueProfile.dueDate }]) {
    assert.throws(() => decodeShare(makeLink(payload), now));
  }
  const storage = memory();
  for (const value of [{ lmp: profile.lmp, cycle: 30 }, { ...profile, method: 'unknown' }, { method: 'due-date' }]) {
    storage.setItem(STORAGE_KEY, JSON.stringify({ v: 2, profile: value, checks: {} }));
    assert.equal(readLocal(storage, now).profile, null);
    assert.ok(readLocal(storage, now).error);
  }
});
