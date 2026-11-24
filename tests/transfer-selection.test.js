import test from 'node:test';
import assert from 'node:assert/strict';
import { selectTransferData, reachableTransferBase } from '../src/transfer-selection.js';
import { createIdentity, sealTransfer, openTransfer, checkIncoming, normalizeDevice } from '../src/device-transfer.js';
const today = '2026-11-24', stamp = '2026-11-23T10:00:00.000Z', password = 'synthetic-sharing-password';
const record = { createdAt: stamp, updatedAt: stamp, deletedAt: null };
const value = { profile: { method: 'period', lmp: '2026-09-14', cycle: 31 }, checks: { secretCheck: true }, journal: [
  { id: 'synthetic-entry-01', date: today, time: '10:00', text: 'PRIVATE-JOURNAL', tags: ['PRIVATE-TAG'], symptoms: ['PRIVATE-SYMPTOM'], metrics: [{ kind: 'weight', value: 65.5 }], ...record },
] };
const care = { v: 1, appointments: [{ id: 'synthetic-appointment', date: today, time: '12:00', title: 'PRIVATE-APPOINTMENT', provider: 'gyn', location: 'PRIVATE-LOCATION', ...record }], notes: [{ id: 'synthetic-question', appointmentId: 'synthetic-appointment', kind: 'qa', date: today, text: 'PRIVATE-QUESTION', answer: 'PRIVATE-ANSWER', nextSteps: 'PRIVATE-NEXT', discussed: false, ...record }] };
const companion = { v: 1, birthDate: null, updatedAt: stamp, plans: [{ id: 'synthetic-plan-01', area: 'tasks', text: 'PRIVATE-PLAN', person: 'PRIVATE-PERSON', done: false, updatedAt: stamp, deletedAt: null }], growth: [{ id: 'synthetic-growth', kind: 'crl', value: 55, date: today, note: 'PRIVATE-GROWTH-NOTE', updatedAt: stamp, deletedAt: null }] };
test('all eight optional scope combinations omit unselected values before encryption, including cross references', () => {
  for (let mask = 0; mask < 8; mask++) {
    const scopes = ['journey', ...['appointments', 'notes', 'measurements'].filter((_, index) => mask & (1 << index))];
    const data = selectTransferData(value, { scopes, care, companion, today });
    const json = JSON.stringify(data);
    for (const marker of ['2026-09-14', 'secretCheck', 'privateKey']) assert.ok(!json.includes(marker));
    for (const [scope, markers] of [['appointments', ['PRIVATE-APPOINTMENT', 'PRIVATE-LOCATION']], ['notes', ['PRIVATE-JOURNAL', 'PRIVATE-TAG', 'PRIVATE-QUESTION', 'PRIVATE-ANSWER', 'PRIVATE-NEXT', 'PRIVATE-PLAN', 'PRIVATE-PERSON']], ['measurements', ['PRIVATE-SYMPTOM']]]) {
      for (const marker of markers) assert.equal(json.includes(marker), scopes.includes(scope), `${scope}: ${marker}`);
    }
    assert.equal(json.includes('PRIVATE-GROWTH-NOTE'), scopes.includes('notes') && scopes.includes('measurements'));
    assert.equal(data.snapshot.journal[0]?.metrics.length || 0, scopes.includes('measurements') ? 1 : 0);
    if (!scopes.includes('appointments')) assert.ok(data.care.notes.every(note => note.appointmentId === null));
    assert.equal(data.snapshot.profile.method, 'due-date');
  }
  assert.throws(() => selectTransferData(value, { scopes: ['notes'], today }));
  assert.throws(() => selectTransferData(value, { scopes: ['journey', 'unknown'], today }));
});
test('selected encrypted links keep scope metadata and exact projected values through signing and opening', async () => {
  const scopes = ['journey', 'notes'];
  const sealed = await sealTransfer(value, await createIdentity(), password, { scopes, care, companion, today });
  const packet = await openTransfer(sealed.envelope, password, today);
  assert.deepEqual(packet.data, selectTransferData(value, { scopes, care, companion, today }));
  const device = checkIncoming(packet, null, {});
  assert.deepEqual(normalizeDevice(device).scopes, scopes);
  assert.equal(checkIncoming(packet, device, { ...packet.data.snapshot, care: packet.data.care, companion: packet.data.companion }).revision, 1);
  const changed = await sealTransfer(value, sealed.device, password, { scopes: ['journey'], care, companion, today });
  const next = await openTransfer(changed.envelope, password, today);
  assert.throws(() => checkIncoming(next, device, packet.data.snapshot), /Umfang/);
  assert.equal(checkIncoming(next, device, packet.data.snapshot, { replace: true }).revision, 2);
  assert.throws(() => checkIncoming({ ...next, revision: 0 }, device, {}, { replace: true }), /älter/);
  assert.throws(() => checkIncoming({ ...next, source: 'a'.repeat(43) }, device, {}, { replace: true }), /anderen Hauptgerät/);
});
test('only usable HTTPS addresses create cross-device QR destinations; credentials and stale links are removed', () => {
  for (const address of ['http://localhost:4173/', 'http://192.168.1.1/', 'https://127.0.0.1/', 'file:///app', 'javascript:alert(1)', 'https://user:pass@example.test/']) assert.throws(() => reachableTransferBase(address));
  assert.equal(reachableTransferBase('https://example.test/app/?private=old#transfer=old'), 'https://example.test/app/');
});
