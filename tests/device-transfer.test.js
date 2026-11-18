import test from 'node:test';
import assert from 'node:assert/strict';
import { createIdentity, sealTransfer, openTransfer, transferLink, parseTransferInput, checkIncoming, commitBundle, recoverBundle, importSnapshot, DEVICE_KEY, RECOVERY_KEY, MAX_TRANSFER_QR_LENGTH, MAX_TRANSFER_LINK_LENGTH, b64 } from '../src/device-transfer.js';
import { STORAGE_KEY, HISTORY_KEY } from '../src/pregnancy.js';
import { BIRTH_KEY, BIRTH_HISTORY_KEY } from '../src/birth.js';
const today = '2026-11-18'; const password = 'synthetic-passphrase-only';
const value = { profile: { method: 'period', lmp: '2026-07-09', cycle: 30 }, checks: { 'synthetic-check': true }, journal: [] };
const entry = { id: 'synthetic-entry-0001', date: today, time: '', text: 'Synthetic test only', symptoms: [], tags: [], metrics: [], createdAt: '2026-11-18T10:00:00.000Z', updatedAt: '2026-11-18T10:00:00.000Z', deletedAt: null };
const memory = () => { const data = new Map(); return { data, getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) }; };
test('signed encrypted stand round-trips locally; contacts are excluded unless explicitly selected', async () => {
  const identity = await createIdentity(); const sealed = await sealTransfer(value, identity, password, { today });
  const packet = await openTransfer(sealed.envelope, password, today);
  assert.equal(packet.source, identity.source); assert.equal(packet.revision, 1);
  assert.equal(packet.data.snapshot.profile.cycle, 30); assert.ok(!Object.hasOwn(packet.data, 'contacts'));
  assert.ok(!JSON.stringify(sealed.envelope).includes('2026-07-09'));
  const contacts = [{ name: 'Synthetic contact', phone: '000123456' }];
  const included = await sealTransfer(value, sealed.device, password, { today, contacts });
  assert.equal((await openTransfer(included.envelope, password, today)).data.contacts[0].name, 'Synthetic contact');
});
test('incorrect passwords, short passwords, tampered ciphertext and invalid master signatures fail closed', async () => {
  const identity = await createIdentity(); const sealed = await sealTransfer(value, identity, password, { today });
  await assert.rejects(() => openTransfer(sealed.envelope, 'wrong-synthetic-password', today));
  await assert.rejects(() => sealTransfer(value, identity, 'short', { today }));
  const data = sealed.envelope.data; await assert.rejects(() => openTransfer({ ...sealed.envelope, data: (data[0] === 'A' ? 'B' : 'A') + data.slice(1) }, password, today));
  const other = await createIdentity(); const forged = await sealTransfer(value, { ...identity, privateKey: other.privateKey }, password, { today });
  await assert.rejects(() => openTransfer(forged.envelope, password, today), /Signatur/);
});
test('unchanged data retain their revision; changes advance it and followers cannot sign', async () => {
  const first = await sealTransfer(value, await createIdentity(), password, { today });
  const same = await sealTransfer(value, first.device, password, { today }); assert.equal(same.device.revision, 1);
  const changed = await sealTransfer({ ...value, journal: [entry] }, same.device, password, { today }); assert.equal(changed.device.revision, 2);
  await assert.rejects(() => sealTransfer(value, { role: 'follower', source: first.device.source, revision: 1 }, password, { today }));
});
test('small stand links omit password, previous query and old sync credentials; large stands use files', async () => {
  const sealed = await sealTransfer(value, await createIdentity(), password, { today });
  const link = transferLink(sealed.envelope, 'https://example.test/app/?secret=old#sync=old');
  assert.ok(link); assert.ok(!link.includes(password)); assert.equal(new URL(link).search, ''); assert.ok(!link.includes('sync='));
  assert.deepEqual(parseTransferInput(link), sealed.envelope); assert.deepEqual(parseTransferInput(JSON.stringify(sealed.envelope)), sealed.envelope);
  const larger = { ...sealed.envelope, data: 'a'.repeat(3000) };
  assert.ok(transferLink(larger, 'https://example.test/'));
  assert.equal(transferLink(larger, 'https://example.test/', { maxLength: MAX_TRANSFER_QR_LENGTH }), null);
  assert.throws(() => parseTransferInput('#sync=old')); assert.throws(() => parseTransferInput('x'.repeat(1200001)));
});
test('compact transport retains older links, removes double encoding and rejects incomplete or unknown formats', async () => {
  const sealed = await sealTransfer(value, await createIdentity(), password, { today });
  const old = `https://example.test/app/#transfer=${b64(new TextEncoder().encode(JSON.stringify(sealed.envelope)))}`;
  const compact = transferLink(sealed.envelope, 'https://example.test/app/');
  assert.ok(compact.length < old.length);
  assert.deepEqual(parseTransferInput(old), sealed.envelope);
  assert.deepEqual(parseTransferInput(compact), sealed.envelope);
  assert.deepEqual((await openTransfer(parseTransferInput(compact), password, today)).data.snapshot, (await openTransfer(parseTransferInput(old), password, today)).data.snapshot);
  const json = { ...sealed.envelope, codec: 'json' };
  assert.deepEqual(parseTransferInput(transferLink(json, 'https://example.test/')), json);
  for (const bad of ['#transfer=3.g.a.b.c', compact.slice(0, compact.lastIndexOf('.')), compact.replace('transfer=2.g.', 'transfer=2.x.')]) assert.throws(() => parseTransferInput(bad));
  assert.throws(() => transferLink({ ...sealed.envelope, codec: 'unknown' }, 'https://example.test/'));
});
test('a stand exceeding QR capacity remains complete in a long link with explicit exact length limits', async () => {
  const text = Array.from(crypto.getRandomValues(new Uint8Array(4500)), byte => byte.toString(16).padStart(2, '0')).join('').slice(0, 3900);
  const sealed = await sealTransfer({ ...value, journal: [{ ...entry, text }] }, await createIdentity(), password, { today });
  const link = transferLink(sealed.envelope, 'https://example.test/pages/');
  assert.ok(link.length > MAX_TRANSFER_QR_LENGTH && link.length < MAX_TRANSFER_LINK_LENGTH);
  assert.equal(transferLink(sealed.envelope, 'https://example.test/pages/', { maxLength: link.length }), link);
  assert.equal(transferLink(sealed.envelope, 'https://example.test/pages/', { maxLength: link.length - 1 }), null);
  assert.equal((await openTransfer(parseTransferInput(link), password, today)).data.snapshot.journal[0].text, text);
});
test('pinned source, monotonic revisions, same-version conflicts and master authority are enforced', async () => {
  const sealed = await sealTransfer(value, await createIdentity(), password, { today }); const packet = await openTransfer(sealed.envelope, password, today);
  const follower = checkIncoming(packet, null, { journal: [] });
  assert.equal(follower.role, 'follower'); assert.equal(checkIncoming(packet, follower, { journal: [] }).revision, 1);
  assert.throws(() => checkIncoming({ ...packet, revision: 0 }, follower, {}));
  assert.throws(() => checkIncoming({ ...packet, digest: 'different' }, follower, {}));
  assert.throws(() => checkIncoming({ ...packet, source: 'b'.repeat(43) }, follower, {}));
  assert.throws(() => checkIncoming(packet, sealed.device, {}));
});
test('missing or older journal observations cannot silently erase a coupled device', async () => {
  const sealed = await sealTransfer(value, await createIdentity(), password, { today }); const packet = await openTransfer(sealed.envelope, password, today);
  const current = { journal: [entry] };
  assert.throws(() => checkIncoming(packet, null, current));
  const follower = checkIncoming(packet, null, current, { replace: true });
  assert.throws(() => checkIncoming(packet, follower, current, { replace: true }));
  const withEntry = { ...packet, revision: 2, data: { snapshot: { ...packet.data.snapshot, journal: [{ ...entry, updatedAt: '2026-11-18T09:00:00.000Z' }] } } };
  assert.throws(() => checkIncoming(withEntry, follower, current), /neuere/);
});
test('bundle interruption rolls all data back before readers proceed', () => {
  const storage = memory(); storage.setItem(STORAGE_KEY, 'before'); storage.setItem(BIRTH_KEY, 'before-birth');
  let writes = 0;
  const interrupted = { ...storage, setItem(key, value) { writes++; if (writes === 3) throw new Error('Quota'); storage.setItem(key, value); } };
  assert.throws(() => commitBundle(interrupted, { [STORAGE_KEY]: 'after', [BIRTH_KEY]: 'after-birth' }));
  assert.equal(storage.getItem(STORAGE_KEY), 'before'); assert.equal(storage.getItem(BIRTH_KEY), 'before-birth'); assert.equal(storage.getItem(RECOVERY_KEY), null);
});
test('startup recovery distinguishes complete commits from partially written bundles', () => {
  const storage = memory(); const record = { v: 1, before: { [STORAGE_KEY]: 'before', [DEVICE_KEY]: null }, after: { [STORAGE_KEY]: 'after', [DEVICE_KEY]: 'device' } };
  storage.setItem(RECOVERY_KEY, JSON.stringify(record)); storage.setItem(STORAGE_KEY, 'after'); recoverBundle(storage);
  assert.equal(storage.getItem(STORAGE_KEY), 'before'); assert.equal(storage.getItem(DEVICE_KEY), null);
  storage.setItem(RECOVERY_KEY, JSON.stringify(record)); storage.setItem(STORAGE_KEY, 'after'); storage.setItem(DEVICE_KEY, 'device'); recoverBundle(storage);
  assert.equal(storage.getItem(STORAGE_KEY), 'after'); assert.equal(storage.getItem(RECOVERY_KEY), null);
});
test('imports archive the previous journal and atomically preserve contacts and device metadata', async () => {
  const storage = memory(); importSnapshot(storage, value, { today });
  const before = storage.getItem(STORAGE_KEY); const identity = await createIdentity();
  importSnapshot(storage, { ...value, journal: [entry] }, { today, device: identity, birth: { contacts: [{ name: 'Synthetic', phone: '000123' }] } });
  assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).journal.length, 1);
  assert.equal(JSON.parse(storage.getItem(HISTORY_KEY))[0].raw, before);
  assert.equal(JSON.parse(storage.getItem(BIRTH_KEY)).contacts.length, 1);
  assert.equal(JSON.parse(storage.getItem(DEVICE_KEY)).source, identity.source);
});
test('quota failure before recovery copy leaves the entire original stand unchanged', () => {
  const storage = memory(); storage.setItem(STORAGE_KEY, 'original');
  assert.throws(() => commitBundle(storage, { 'unexpected-key': 'replacement' }));
  const broken = { ...storage, setItem() { throw new Error('Quota'); } };
  assert.throws(() => commitBundle(broken, { [STORAGE_KEY]: 'replacement' }));
  assert.equal(storage.getItem(STORAGE_KEY), 'original'); assert.equal(storage.data.size, 1);
});
test('contact-only backups restore without inventing a profile and archive the previous contacts', () => {
  const storage = memory();
  const before = { contacts: [{ name: 'Synthetic previous', phone: '000111' }] };
  const birth = { contacts: [{ name: 'Synthetic restored', phone: '000222' }] };
  storage.setItem(BIRTH_KEY, JSON.stringify(before));
  assert.equal(importSnapshot(storage, null, { birth, today }), null);
  assert.equal(storage.getItem(STORAGE_KEY), null);
  assert.equal(JSON.parse(storage.getItem(BIRTH_KEY)).contacts[0].name, 'Synthetic restored');
  assert.equal(JSON.parse(storage.getItem(BIRTH_HISTORY_KEY))[0].raw, JSON.stringify(before));
  importSnapshot(storage, value, { today });
  const profile = storage.getItem(STORAGE_KEY);
  importSnapshot(storage, null, { birth: before, today });
  assert.equal(storage.getItem(STORAGE_KEY), profile);
  assert.throws(() => importSnapshot(storage, null));
});
test('a substantial journal uses the encrypted file route and round-trips without truncation', async () => {
  const journal = Array.from({ length: 90 }, (_, index) => ({ ...entry, id: `synthetic-large-${String(index).padStart(4, '0')}`, text: Array.from(crypto.getRandomValues(new Uint8Array(2200)), byte => byte.toString(16).padStart(2, '0')).join('').slice(0, 3900) }));
  const sealed = await sealTransfer({ ...value, journal }, await createIdentity(), password, { today });
  assert.equal(transferLink(sealed.envelope, 'https://example.test/app/'), null);
  const packet = await openTransfer(sealed.envelope, password, today);
  assert.equal(packet.data.snapshot.journal.length, journal.length);
  assert.deepEqual(packet.data.snapshot.journal.map(item => item.text), journal.map(item => item.text));
});
