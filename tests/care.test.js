import test from 'node:test';
import assert from 'node:assert/strict';
import { CARE_KEY, CARE_HISTORY_KEY, normalizeCare, readCare, writeCare, upsertCare, archiveCare, careCollection, appointmentsOnDate, careContinuity } from '../src/care.js';
import { createIdentity, sealTransfer, openTransfer, checkIncoming, importSnapshot, commitBundle, RECOVERY_KEY } from '../src/device-transfer.js';
import { STORAGE_KEY } from '../src/pregnancy.js';
import { projectReport, reportDocument, reportItemCount } from '../src/report.js';
import { pregnancyTimeline, gestationOnDate } from '../src/calendar.js';

const today = '2026-11-18', now = '2026-11-18T10:00:00.000Z';
const stamp = { createdAt: now, updatedAt: now, deletedAt: null };
const appointment = { id: 'synthetic-appointment-0001', date: '2026-12-02', time: '09:30', title: 'Synthetic visit', provider: 'midwife', location: 'Synthetic private place', ...stamp };
const question = { id: 'synthetic-question-0001', appointmentId: appointment.id, date: today, kind: 'qa', text: 'Synthetic private question', answer: 'Synthetic private answer', nextSteps: 'Synthetic private next step', discussed: false, ...stamp };
const data = () => normalizeCare({ v: 1, appointments: [appointment], notes: [question] }, today);
const value = { profile: { method: 'period', lmp: '2026-07-09', cycle: 30 }, checks: {}, journal: [] };
const memory = () => { const values = new Map(); return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) }; };

test('appointments can be future-dated while preparation notes retain their real date', () => {
  assert.equal(data().appointments[0].date, '2026-12-02'); assert.equal(data().notes[0].date, today);
  assert.throws(() => normalizeCare({ ...data(), notes: [{ ...question, date: '2026-11-19' }] }, today));
  assert.equal(appointmentsOnDate(data(), appointment.date).length, 1);
  const timeline = pregnancyTimeline(value.profile, today);
  assert.equal(gestationOnDate(timeline, appointment.date).age - gestationOnDate(timeline, today).age, 14);
});
test('notes without a visit can later be assigned with the same ID and creation timestamp', () => {
  let current = upsertCare(normalizeCare(), 'notes', { ...question, appointmentId: null }, null, now, today);
  const original = current.notes[0]; current = upsertCare(current, 'appointments', appointment, null, now, today);
  current = upsertCare(current, 'notes', { ...original, appointmentId: current.appointments[0].id }, original, '2026-11-18T11:00:00.000Z', today);
  assert.equal(current.notes[0].id, original.id); assert.equal(current.notes[0].createdAt, original.createdAt);
  assert.equal(careCollection(current).length, 1); assert.equal(careCollection(current, { appointmentId: current.appointments[0].id }).length, 1);
});
test('one note powers the appointment and collection views without duplicate content', () => {
  const current = data(); const note = current.notes[0];
  const updated = upsertCare(current, 'notes', { ...note, answer: 'Synthetic changed answer', discussed: true }, note, '2026-11-18T11:00:00.000Z', today);
  assert.equal(updated.notes.length, 1);
  assert.equal(careCollection(updated)[0].answer, careCollection(updated, { appointmentId: appointment.id })[0].answer);
  assert.equal(careCollection(updated, { open: true }).length, 0);
});
test('an answer does not automatically close a question and discussion does not invent an answer', () => {
  assert.equal(careCollection(data(), { open: true }).length, 1);
  const current = normalizeCare({ v: 1, appointments: [], notes: [{ ...question, appointmentId: null, discussed: true, answer: '' }] }, today);
  assert.equal(current.notes[0].answer, ''); assert.equal(careCollection(current, { open: true }).length, 0);
});
test('archiving a visit preserves linked notes, while archiving a note is reversible independently', () => {
  let current = archiveCare(data(), 'appointments', appointment.id, true, now, today);
  assert.equal(appointmentsOnDate(current, appointment.date).length, 0); assert.equal(careCollection(current).length, 1); assert.equal(current.notes[0].appointmentId, appointment.id);
  current = archiveCare(current, 'notes', question.id, true, now, today); assert.equal(careCollection(current).length, 0);
  assert.equal(careCollection(current, { archived: true }).length, 1);
  current = archiveCare(current, 'notes', question.id, false, now, today); assert.equal(careCollection(current).length, 1);
});
test('invalid references, duplicate IDs, dates, times, kinds and timestamps fail without mutating originals', () => {
  const original = JSON.stringify(data());
  for (const changes of [{ time: '25:00' }, { time: 0 }, { date: '2026-02-30' }, { date: '2201-01-01' }, { provider: 'unknown' }, { title: '' }, { updatedAt: 'yesterday' }]) assert.throws(() => normalizeCare({ ...data(), appointments: [{ ...appointment, ...changes }] }, today));
  for (const changes of [{ appointmentId: 'synthetic-missing-0001' }, { kind: 'unknown' }, { discussed: 'yes' }, { text: '' }, { kind: 'note', answer: 'would be hidden' }]) assert.throws(() => normalizeCare({ ...data(), notes: [{ ...question, ...changes }] }, today));
  assert.throws(() => normalizeCare({ ...data(), notes: [question, question] }, today)); assert.equal(JSON.stringify(data()), original);
});
test('stale edits and size limits never silently truncate a collection', () => {
  const current = data();
  assert.throws(() => upsertCare(current, 'notes', question, { ...question, updatedAt: '2026-11-18T09:00:00.000Z' }, now, today));
  assert.throws(() => normalizeCare({ ...current, appointments: Array.from({ length: 101 }, (_, i) => ({ ...appointment, id: `synthetic-appointment-${i}` })) }, today));
  assert.throws(() => normalizeCare({ ...current, notes: Array.from({ length: 100 }, (_, i) => ({ ...question, id: `synthetic-question-${i}`, text: 'x'.repeat(4000) })) }, today));
  assert.equal(current.notes.length, 1);
});
test('search includes answers, next steps and appointment title; unassigned and open filters stay exact', () => {
  assert.equal(careCollection(data(), { search: 'PRIVATE ANSWER' }).length, 1);
  assert.equal(careCollection(data(), { search: 'next step' }).length, 1);
  assert.equal(careCollection(data(), { search: 'visit' }).length, 1);
  assert.equal(careCollection(data(), { appointmentId: null }).length, 0);
  assert.equal(careCollection(data(), { search: 'not-present' }).length, 0);
});
test('local history is written before replacement and quota failures leave active data intact', () => {
  const storage = memory(); writeCare(storage, data(), today); const before = storage.getItem(CARE_KEY);
  const changed = { ...data(), notes: [{ ...question, answer: 'Synthetic changed answer', updatedAt: '2026-11-18T11:00:00.000Z' }] };
  writeCare(storage, changed, today); assert.equal(JSON.parse(storage.getItem(CARE_HISTORY_KEY))[0].raw, before);
  const raw = storage.getItem(CARE_KEY);
  const broken = { ...storage, setItem(key, value) { if (key === CARE_HISTORY_KEY) throw new Error('Quota'); storage.setItem(key, value); } };
  assert.throws(() => writeCare(broken, data(), today)); assert.equal(storage.getItem(CARE_KEY), raw);
});
test('care-only backup restoration never needs or overwrites a pregnancy profile', () => {
  const storage = memory(); importSnapshot(storage, null, { care: data(), today }); assert.equal(storage.getItem(STORAGE_KEY), null);
  assert.deepEqual(readCare(storage, today), data());
  importSnapshot(storage, value, { today }); const before = storage.getItem(STORAGE_KEY);
  importSnapshot(storage, null, { care: normalizeCare(), today }); assert.equal(storage.getItem(STORAGE_KEY), before);
  assert.equal(JSON.parse(storage.getItem(CARE_HISTORY_KEY))[0].raw, JSON.stringify(data()));
});
test('care import participates in durable multi-key rollback', () => {
  const storage = memory(); storage.setItem(CARE_KEY, 'previous-care'); storage.setItem(STORAGE_KEY, 'previous-profile'); let count = 0;
  const broken = { ...storage, setItem(key, value) { if (++count === 3) throw new Error('Quota'); storage.setItem(key, value); } };
  assert.throws(() => commitBundle(broken, { [CARE_KEY]: 'new-care', [STORAGE_KEY]: 'new-profile' }));
  assert.equal(storage.getItem(CARE_KEY), 'previous-care'); assert.equal(storage.getItem(STORAGE_KEY), 'previous-profile'); assert.equal(storage.getItem(RECOVERY_KEY), null);
});
test('encrypted v2 stands preserve visits, answers, archive and links across device imports', async () => {
  const current = archiveCare(data(), 'appointments', appointment.id, true, now, today);
  const sealed = await sealTransfer(value, await createIdentity(), 'synthetic-care-password', { care: current, today });
  const packet = await openTransfer(sealed.envelope, 'synthetic-care-password', today);
  assert.deepEqual(packet.data.care, current);
  const second = memory(); importSnapshot(second, packet.data.snapshot, { care: packet.data.care, today });
  assert.equal(readCare(second, today).notes[0].answer, question.answer); assert.ok(readCare(second, today).appointments[0].deletedAt);
});
test('legacy stands remain readable but cannot erase existing appointment data without an explicit initial replacement', async () => {
  const sealed = await sealTransfer(value, await createIdentity(), 'synthetic-care-password', { today });
  const packet = await openTransfer(sealed.envelope, 'synthetic-care-password', today);
  assert.ok(!Object.hasOwn(packet.data, 'care'));
  assert.throws(() => checkIncoming(packet, null, { ...value, care: data() }));
  const follower = checkIncoming(packet, null, { ...value, care: data() }, { replace: true });
  assert.throws(() => checkIncoming(packet, follower, { ...value, care: data() }, { replace: true }));
});
test('appointment-only edits advance the signed version even with an unchanged journal', async () => {
  const first = await sealTransfer(value, await createIdentity(), 'synthetic-care-password', { care: data(), today });
  const unchanged = await sealTransfer(value, first.device, 'synthetic-care-password', { care: data(), today });
  assert.equal(unchanged.device.revision, first.device.revision);
  const changed = upsertCare(data(), 'notes', { ...question, answer: 'Synthetic new answer' }, question, '2026-11-18T11:00:00.000Z', today);
  const next = await sealTransfer(value, unchanged.device, 'synthetic-care-password', { care: changed, today });
  assert.equal(next.device.revision, first.device.revision + 1);
});
test('missing and older notes cannot be accepted merely because the stand revision increased', () => {
  assert.throws(() => careContinuity(normalizeCare(), data(), today));
  const older = { ...data(), notes: [{ ...question, answer: 'Synthetic differing answer' }] };
  assert.throws(() => careContinuity(older, data(), today));
  assert.doesNotThrow(() => careContinuity(data(), data(), today));
});
test('sharing journal fields excludes all appointment questions and metadata from the entire artifact', () => {
  const report = projectReport([], { from: today, to: '2026-12-31', fields: ['text', 'metrics'], care: data() });
  const content = JSON.stringify(report) + reportDocument(report);
  for (const secret of [question.text, question.answer, question.nextSteps, appointment.title, appointment.location, appointment.id, question.id]) assert.ok(!content.includes(secret), secret);
});
test('sharing notes and appointment metadata are independent explicit choices', () => {
  const opts = { from: today, to: today, care: data() };
  const notes = projectReport([], { ...opts, fields: ['careNotes'] }); const content = reportDocument(notes);
  assert.equal(reportItemCount(notes), 1); assert.ok(content.includes(question.text)); assert.ok(content.includes(question.answer)); assert.ok(!content.includes(appointment.location)); assert.ok(!content.includes(appointment.title));
  const combined = projectReport([], { ...opts, fields: ['careNotes', 'appointments'] }); assert.equal(combined.careNotes[0].appointment.date, appointment.date);
  assert.ok(reportDocument(combined).includes(appointment.location));
  const visits = projectReport([], { ...opts, to: '2026-12-31', fields: ['appointments'] }); assert.equal(visits.appointments.length, 1); assert.ok(!reportDocument(visits).includes(question.text));
});
test('individual omissions, archived notes and escaping apply to appointment reports', () => {
  const options = { from: today, to: '2026-12-31', care: data(), fields: ['careNotes', 'appointments'] };
  const omitted = projectReport([], { ...options, excluded: ['care-note:' + question.id, 'care-appointment:' + appointment.id] }); assert.equal(reportItemCount(omitted), 0);
  const archived = archiveCare(data(), 'notes', question.id, true, now, today); assert.equal(projectReport([], { ...options, care: archived }).careNotes.length, 0);
  const unsafe = { ...data(), notes: [{ ...question, text: '<script>alert(1)</script>' }] };
  const content = reportDocument(projectReport([], { ...options, care: unsafe })); assert.ok(!content.includes('<script>')); assert.ok(content.includes('&lt;script&gt;'));
});
