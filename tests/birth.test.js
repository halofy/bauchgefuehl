import test from 'node:test';
import assert from 'node:assert/strict';
import { phoneNumber, normalizeBirth, readBirth, writeBirth, startContraction, finishContraction, contractionMeasurements, contractionPattern, showContractionFab, BIRTH_KEY } from '../src/birth.js';
import { todayISO } from '../src/dates.js';
const now = new Date(2026, 10, 18, 12).getTime();
const random = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const pending = start => startContraction(start, random);
const log = (entries, start, seconds = 60, excluded = false) => finishContraction(entries, pending(start), start + seconds * 1000, { today: '2026-11-18', excluded });
const memory = () => { const data = new Map(); return { data, getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) }; };
test('three optional named contacts normalize to safe telephone targets', () => {
  assert.equal(phoneNumber('+49 (000) 123-456'), '+49000123456');
  assert.equal(phoneNumber('000 / 123 456'), '000123456');
  assert.equal(normalizeBirth({ contacts: [{ name: 'Synthetischer Kontakt', phone: '000 123 456' }] }).contacts[0].phone, '000123456');
  assert.equal(normalizeBirth().contacts.length, 0);
  assert.throws(() => normalizeBirth({ contacts: Array(4).fill({ name: 'Test', phone: '000123' }) }));
  assert.throws(() => normalizeBirth({ contacts: [{ name: '', phone: '000123' }] }));
});
test('telephone values reject scripts, service codes, injected parameters and incomplete contacts', () => {
  for (const phone of ['javascript:alert(1)', 'tel:123', '*21#', '+123;phone-context=evil', '123\n456', '12', '++1234']) assert.throws(() => phoneNumber(phone), phone);
  assert.throws(() => normalizeBirth({ contacts: [{ name: 'Test', phone: '' }] }));
  assert.throws(() => normalizeBirth({ mode: 'unknown' }));
});
test('pending measurement survives reload and saves fail without replacing the previous record', () => {
  const storage = memory(); const active = pending(now);
  writeBirth(storage, { active }); assert.deepEqual(readBirth(storage).active, active);
  const previous = storage.getItem(BIRTH_KEY);
  const broken = { ...storage, setItem() { throw new Error('Quota'); } };
  assert.throws(() => writeBirth(broken, { active: null })); assert.equal(storage.getItem(BIRTH_KEY), previous);
});
test('finishing logs duration and start-to-start interval in the existing journal format', () => {
  let entries = log([], now - 300000, 60); entries = log(entries, now, 75);
  const latest = entries.find(entry => entry.id === pending(now).id);
  assert.equal(latest.metrics.find(metric => metric.label === 'Wehendauer').value, 75);
  assert.equal(latest.metrics.find(metric => metric.label === 'Abstand Wehenbeginn').value, 300);
  assert.equal(latest.tags[0], 'Wehen');
});
test('cross-midnight measurements stay on their beginning calendar date', () => {
  const start = new Date(2026, 10, 17, 23, 59, 40).getTime();
  const entries = log([], start, 60);
  assert.equal(entries[0].date, todayISO(new Date(start))); assert.equal(entries[0].time, '23:59');
});
test('retry after a completed journal save cannot create a duplicate or overwrite the result', () => {
  const entries = log([], now, 60);
  assert.deepEqual(finishContraction(entries, pending(now), now + 90000000, { today: '2026-11-18' }), entries);
  assert.throws(() => log([], now, -10)); assert.throws(() => log([], now, 86401));
});
test('archived, deliberately excluded, malformed and future measurements cannot form a pattern', () => {
  const first = log([], now, 60);
  assert.equal(contractionMeasurements([{ ...first[0], deletedAt: first[0].updatedAt }]).length, 0);
  assert.equal(contractionMeasurements(log([], now, 60, true)).length, 0);
  assert.equal(contractionMeasurements([{ ...first[0], id: 'synthetic-normal-entry' }]).length, 0);
  assert.equal(contractionPattern(first, now - 1).count, 0);
});
test('first-birth timing needs an hour, one-minute durations and regular five-minute-or-shorter gaps', () => {
  let entries = [];
  for (let index = 0; index < 13; index++) entries = log(entries, now - 3660000 + index * 300000, 60);
  assert.equal(contractionPattern(entries, now).matched, true);
  assert.equal(contractionPattern(entries.slice(1), now).matched, false);
  assert.equal(contractionPattern(entries, now + 16 * 60000).matched, false);
});
test('short, overlapping and interrupted observations do not satisfy the displayed timing rule', () => {
  let short = []; let overlap = []; let interrupted = [];
  for (let index = 0; index < 13; index++) {
    short = log(short, now - 3660000 + index * 300000, 30);
    overlap = log(overlap, now - 720000 + index * 60000, 120);
    interrupted = log(interrupted, now - 4320000 + index * 360000, 60);
  }
  assert.equal(contractionPattern(short, now).matched, false);
  assert.equal(contractionPattern(overlap, now).matched, false);
  assert.equal(contractionPattern(interrupted, now).matched, false);
});
test('subsequent-birth timing is a separate three-observation, ten-minute orientation', () => {
  let entries = []; for (let index = 0; index < 3; index++) entries = log(entries, now - 1260000 + index * 600000, 60);
  assert.equal(contractionPattern(entries, now, 'subsequent').matched, true);
  assert.equal(contractionPattern(entries.slice(1), now, 'subsequent').matched, false);
  assert.equal(contractionPattern(entries, now, 'first').matched, false);
});
test('floating access begins at 22+0 for own profiles and is always retained for an open measurement', () => {
  assert.equal(showContractionFab(153, null), false); assert.equal(showContractionFab(154, null), true);
  assert.equal(showContractionFab(200, null, false), false); assert.equal(showContractionFab(20, pending(now), false), true);
});
