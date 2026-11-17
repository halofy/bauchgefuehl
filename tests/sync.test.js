import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { SyncRoom } from '../sync-server/worker.js';
import { SyncEngine, SYNC_KEY, snapshot, randomToken, invitation, parseInvitation, encryptSnapshot, decryptSnapshot, endpointURL } from '../src/sync.js';
import { STORAGE_KEY, HISTORY_KEY, writeLocal } from '../src/pregnancy.js';
import { normalizeEntry, archiveEntry } from '../src/journal.js';

const initial = { profile: { method: 'period', lmp: '2026-07-09', cycle: 30, irregular: false }, checks: {} };
const changed = { profile: { method: 'due-date', dueDate: '2027-04-17' }, checks: { 'scan-1': true } };
const origin = 'https://example.github.io';
function memory() {
  const map = new Map();
  return { map, getItem: k => map.get(k) ?? null, setItem: (k, v) => map.set(k, v), removeItem: k => map.delete(k) };
}
class DurableStorage {
  constructor() { this.map = new Map(); this.tail = Promise.resolve(); }
  transaction(action) {
    const result = this.tail.then(async () => {
      const copy = structuredClone(this.map);
      const tx = {
        get: async k => structuredClone(copy.get(k)),
        put: async (k, v) => copy.set(k, structuredClone(v)),
        delete: async k => copy.delete(k),
        list: async ({ prefix }) => new Map([...copy].filter(([k]) => k.startsWith(prefix)).sort(([a], [b]) => a.localeCompare(b))),
      };
      const response = await action(tx);
      this.map = copy;
      return response;
    });
    this.tail = result.catch(() => {});
    return result;
  }
}
function service() {
  const rooms = new Map();
  const env = {
    ADMIN_TOKEN: 'synthetic-test-admin-token', ALLOWED_ORIGINS: origin,
    ROOMS: { idFromName: name => name, get(name) {
      if (!rooms.has(name)) { const storage = new DurableStorage(); rooms.set(name, { storage, room: new SyncRoom({ storage }) }); }
      return rooms.get(name).room;
    } },
  };
  const transport = { offline: false, losePut: false, losePost: false };
  const fetcher = async (url, init = {}) => {
    if (transport.offline) throw new Error('Offline');
    const headers = new Headers(init.headers); headers.set('Origin', origin);
    const result = await worker.fetch(new Request(url, { ...init, headers }), env);
    if (transport.losePut && init.method === 'PUT') { transport.losePut = false; throw new Error('Antwort verloren'); }
    if (transport.losePost && init.method === 'POST') { transport.losePost = false; throw new Error('Antwort verloren'); }
    return result;
  };
  return { rooms, env, transport, fetcher };
}
function client(server, value = initial, storage = memory()) {
  const box = { value: structuredClone(value), updates: 0, statuses: [] };
  if (!storage.getItem(STORAGE_KEY)) writeLocal(storage, box.value.profile, box.value.checks, undefined, box.value.journal);
  const make = () => new SyncEngine({ storage, fetcher: server.fetcher, getSnapshot: () => box.value, applySnapshot(value, options = {}) {
    writeLocal(storage, value.profile, value.checks, undefined, value.journal, options);
    box.value = structuredClone(value); box.updates++;
  }, onStatus: value => box.statuses.push(value) });
  return { box, storage, make, engine: make() };
}
const settled = async engine => {
  const end = Date.now() + 3000;
  while (engine.busy && Date.now() < end) await new Promise(r => setTimeout(r, 1));
  assert.equal(engine.busy, false, 'Sync operation timed out');
};
const create = async c => c.engine.create('https://sync.example', 'synthetic-test-admin-token');
const followerConfig = c => parseInvitation(new URL(invitation(c.engine.connection, `${origin}/calculator/`)).hash);
const edit = async (c, value) => {
  writeLocal(c.storage, value.profile, value.checks, undefined, value.journal);
  c.box.value = structuredClone(value);
  c.engine.queue(value);
  await settled(c.engine);
};

test('encryption uses fresh IVs and authenticates both data and room', async () => {
  const config = { key: randomToken(), room: randomToken() };
  const first = await encryptSnapshot(initial, config);
  const second = await encryptSnapshot(initial, config);
  assert.notEqual(first.iv, second.iv);
  assert.notEqual(first.data, second.data);
  assert.deepEqual(await decryptSnapshot(first, config), snapshot(initial));
  await assert.rejects(() => decryptSnapshot(first, { ...config, key: randomToken() }));
  await assert.rejects(() => decryptSnapshot(first, { ...config, room: randomToken() }));
  const tampered = { ...first, data: (first.data[0] === 'A' ? 'B' : 'A') + first.data.slice(1) };
  await assert.rejects(() => decryptSnapshot(tampered, config));
});

test('device invitations contain read rights but no master credentials or plaintext health data', async () => {
  const c = client(service()); await create(c);
  const link = invitation(c.engine.connection, `${origin}/calculator/?discard=yes#old`);
  assert.equal(new URL(link).search, '');
  const parsed = parseInvitation(new URL(link).hash);
  assert.equal(parsed.role, 'follower');
  assert.equal(parsed.writeToken, undefined);
  assert.equal(parsed.pending, undefined);
  assert.equal(parsed.published, undefined);
  const raw = JSON.parse(atob(new URL(link).hash.slice(6).replaceAll('-', '+').replaceAll('_', '/')));
  assert.deepEqual(Object.keys(raw).sort(), ['endpoint', 'key', 'readToken', 'revision', 'role', 'room', 'v']);
  assert.doesNotMatch(JSON.stringify(raw), /2026-07-09|cycle|writeToken/);
  assert.equal(parseInvitation('#s=old'), null);
  assert.throws(() => parseInvitation('#sync=bad!'));
});

test('endpoints require HTTPS except explicit loopback development', () => {
  assert.equal(endpointURL('https://sync.example/'), 'https://sync.example');
  assert.equal(endpointURL('http://localhost:8787'), 'http://localhost:8787');
  for (const value of ['http://sync.example', 'https://user:pass@sync.example', 'https://sync.example/path', 'https://sync.example/?key=secret', 'javascript:alert(1)']) assert.throws(() => endpointURL(value));
});

test('complete master-to-follower sync preserves existing follower data in recovery history', async () => {
  const server = service(); const master = client(server); await create(master);
  const prior = { profile: { method: 'due-date', dueDate: '2027-05-01' }, checks: { 'scan-2': true } };
  const follower = client(server, prior);
  await follower.engine.join(followerConfig(master));
  assert.deepEqual(follower.box.value, snapshot(initial));
  const history = JSON.parse(follower.storage.getItem(HISTORY_KEY));
  assert.deepEqual(JSON.parse(history[0].raw).profile, prior.profile);
  await edit(master, changed);
  await follower.engine.tick();
  assert.deepEqual(follower.box.value, snapshot(changed));
  assert.equal(master.engine.connection.revision, 2);
  assert.equal(follower.engine.connection.revision, 2);
  assert.throws(() => follower.engine.queue(initial), /Master/);
});

test('server rejects follower writes and stale master revisions without changing the latest version', async () => {
  const server = service(); const master = client(server); await create(master);
  const read = followerConfig(master);
  const request = { mutationId: randomToken(), baseRevision: 1, envelope: await encryptSnapshot(changed, read) };
  await assert.rejects(() => master.engine.request(read, 'PUT', request), error => error.status === 403);
  await edit(master, changed);
  await assert.rejects(() => master.engine.request(master.engine.connection, 'PUT', { ...request, mutationId: randomToken() }), error => error.status === 409);
  const remote = await master.engine.request(master.engine.connection, 'GET');
  assert.equal(remote.revision, 2);
  assert.deepEqual(await decryptSnapshot(remote.envelope, read), snapshot(changed));
  await assert.rejects(() => master.engine.request(read, 'GET', null, { history: true }), error => error.status === 403);
});

test('offline changes survive a full client restart and upload on reconnection', async () => {
  const server = service(); const master = client(server); await create(master);
  server.transport.offline = true;
  await edit(master, changed);
  assert.ok(JSON.parse(master.storage.getItem(SYNC_KEY)).inflight);
  assert.deepEqual(JSON.parse(master.storage.getItem(STORAGE_KEY)).profile, changed.profile);
  assert.throws(() => master.engine.disconnect(), /Backup/);
  master.engine = master.make();
  server.transport.offline = false;
  await master.engine.tick();
  assert.equal(master.engine.connection.revision, 2);
  assert.equal(master.engine.connection.pending, undefined);
  assert.equal(master.engine.connection.inflight, undefined);
});

test('a lost successful response is retried idempotently after restart', async () => {
  const server = service(); const master = client(server); await create(master);
  server.transport.losePut = true;
  await edit(master, changed);
  assert.equal(master.engine.connection.revision, 1);
  assert.ok(master.engine.connection.inflight);
  master.engine = master.make();
  await master.engine.tick();
  assert.equal(master.engine.connection.revision, 2);
  const { versions } = await master.engine.history();
  assert.equal(versions.length, 2);
});

test('credentials persist before room creation, including an uncertain POST result', async () => {
  const server = service(); const master = client(server);
  server.transport.losePost = true;
  await assert.rejects(() => create(master));
  const saved = JSON.parse(master.storage.getItem(SYNC_KEY));
  assert.ok(saved.writeToken); assert.ok(saved.key); assert.ok(saved.inflight);
  assert.equal(saved.ready, false);
  master.engine = master.make();
  await master.engine.tick();
  assert.equal(master.engine.connection.ready, true);
  assert.equal(master.engine.connection.revision, 1);
  assert.equal((await master.engine.history()).versions.length, 1);
});

test('duplicate masters cause a persistent conflict, never an automatic overwrite', async () => {
  const server = service(); const first = client(server); await create(first);
  const secondStorage = memory();
  secondStorage.setItem(SYNC_KEY, first.storage.getItem(SYNC_KEY));
  const second = client(server, initial, secondStorage);
  await edit(first, changed);
  const other = { ...initial, checks: { 'scan-3': true } };
  await edit(second, other);
  assert.equal(second.engine.connection.conflict, true);
  assert.deepEqual(JSON.parse(second.storage.getItem(STORAGE_KEY)).checks, other.checks);
  const remote = await first.engine.request(first.engine.connection, 'GET');
  assert.deepEqual(await decryptSnapshot(remote.envelope, first.engine.connection), snapshot(changed));
  second.engine = second.make(); await second.engine.tick();
  assert.equal(second.engine.connection.conflict, true);
  // Explicit recovery preserves the old local profile in local history.
  await second.engine.acceptRemote();
  assert.equal(second.engine.connection.conflict, false);
  assert.deepEqual(second.box.value, snapshot(changed));
  assert.ok(JSON.parse(second.storage.getItem(HISTORY_KEY)).some(h => JSON.parse(h.raw).checks['scan-3']));
});

test('a local save before an interrupted queue is recovered on the next launch', async () => {
  const server = service(); const master = client(server); await create(master);
  writeLocal(master.storage, changed.profile, changed.checks);
  master.box.value = structuredClone(changed);
  master.engine = master.make();
  await master.engine.tick();
  assert.equal(master.engine.connection.revision, 2);
  const remote = await master.engine.request(master.engine.connection, 'GET');
  assert.deepEqual(await decryptSnapshot(remote.envelope, master.engine.connection), snapshot(changed));
});

test('missing follower cache is restored even when its saved revision matches the server', async () => {
  const server = service(); const master = client(server); await create(master);
  const follower = client(server); await follower.engine.join(followerConfig(master));
  follower.box.value = changed;
  await follower.engine.tick();
  assert.deepEqual(follower.box.value, snapshot(initial));
});

test('a failed recovery archive prevents overwriting a previous local profile', () => {
  const storage = memory(); writeLocal(storage, initial.profile, initial.checks);
  const before = storage.getItem(STORAGE_KEY);
  const baseSet = storage.setItem;
  storage.setItem = (key, value) => { if (key === HISTORY_KEY) throw new Error('Quota'); baseSet(key, value); };
  assert.throws(() => writeLocal(storage, changed.profile, changed.checks), /Quota/);
  assert.equal(storage.getItem(STORAGE_KEY), before);
});

test('server history retains the last 20 encrypted revisions and no health plaintext', async () => {
  const server = service(); const master = client(server); await create(master);
  for (let i = 0; i < 22; i++) await edit(master, { ...initial, checks: { [`item-${i}`]: true } });
  const { versions } = await master.engine.history();
  assert.equal(versions.length, 20);
  assert.equal(versions[0].revision, 4);
  assert.equal(versions.at(-1).revision, 23);
  const stored = [...server.rooms.values()][0].storage.map;
  assert.doesNotMatch(JSON.stringify([...stored]), /2026-07-09|cycle|item-21/);
});

test('room creation requires configured origin and admin authentication', async () => {
  const server = service();
  const url = `https://sync.example/rooms/${randomToken()}`;
  assert.equal((await worker.fetch(new Request(url), server.env)).status, 403);
  assert.equal((await worker.fetch(new Request(url, { method: 'POST', headers: { Origin: origin, Authorization: 'Bearer wrong' }, body: '{}' }), server.env)).status, 401);
  const preflight = await worker.fetch(new Request(url, { method: 'OPTIONS', headers: { Origin: origin } }), server.env);
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), origin);
});

test('a second edit arriving during upload is retained and sent after the first acknowledgment', async () => {
  const server = service(); const master = client(server); await create(master);
  const original = master.engine.fetcher;
  let release, started;
  const waiting = new Promise(resolve => { started = resolve; });
  const gate = new Promise(resolve => { release = resolve; });
  let once = true;
  master.engine.fetcher = async (url, init) => {
    if (once && init.method === 'PUT') { once = false; started(); await gate; }
    return original(url, init);
  };
  master.box.value = changed;
  master.engine.queue(changed);
  await waiting;
  const newer = { ...changed, checks: { 'scan-1': true, 'scan-2': true } };
  master.box.value = newer;
  master.engine.queue(newer);
  release(); await settled(master.engine);
  assert.ok(master.engine.connection.pending);
  await master.engine.tick();
  assert.equal(master.engine.connection.revision, 3);
  const remote = await master.engine.request(master.engine.connection, 'GET');
  assert.deepEqual(await decryptSnapshot(remote.envelope, master.engine.connection), snapshot(newer));
});

test('missing durable credential storage prevents room creation before any network request', async () => {
  const server = service(); const master = client(server);
  master.storage.setItem = () => { throw new Error('Quota'); };
  await assert.rejects(() => create(master), /Quota/);
  assert.equal(server.rooms.size, 0);
});

test('tampered remote data never replaces an existing follower snapshot', async () => {
  const server = service(); const master = client(server); await create(master);
  const follower = client(server); await follower.engine.join(followerConfig(master));
  await edit(master, changed);
  const storage = [...server.rooms.values()][0].storage;
  const blobKey = 'blob:000000000002:0';
  const envelope = JSON.parse(storage.map.get(blobKey));
  envelope.data = 'A'.repeat(envelope.data.length);
  storage.map.set(blobKey, JSON.stringify(envelope));
  const before = structuredClone(follower.box.value);
  await follower.engine.tick();
  assert.deepEqual(follower.box.value, before);
  assert.equal(follower.engine.connection.revision, 1);
  assert.match(follower.box.statuses.at(-1), /ausstehend/);
});

test('follower storage failure prevents connection adoption and revision advancement', async () => {
  const server = service(); const master = client(server); await create(master);
  const follower = client(server, changed);
  const previous = follower.storage.getItem(STORAGE_KEY);
  const set = follower.storage.setItem;
  follower.storage.setItem = (key, value) => { if (key === HISTORY_KEY) throw new Error('Quota'); set(key, value); };
  await assert.rejects(() => follower.engine.join(followerConfig(master)), /Quota/);
  assert.equal(follower.engine.connection, null);
  assert.equal(follower.storage.getItem(STORAGE_KEY), previous);
});

const journalEntry = (extra = {}) => normalizeEntry({ id: 'synthetic-entry-0001', date: '2026-11-16', time: '10:00', text: 'Synthetische Journalnotiz', symptoms: ['Müdigkeit'], tags: ['Test'], metrics: [{ kind: 'weight', value: 65.5 }, { kind: 'belly', value: 90 }], createdAt: '2026-11-16T10:00:00.000Z', updatedAt: '2026-11-16T10:00:00.000Z', ...extra });
async function legacyEnvelope(value, config) {
  const key = await crypto.subtle.importKey('raw', Buffer.from(config.key, 'base64url'), 'AES-GCM', false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(`bauchgefuehl-sync-v1:${config.room}`) }, key, new TextEncoder().encode(JSON.stringify(value)));
  return { v: 1, iv: Buffer.from(iv).toString('base64url'), data: Buffer.from(data).toString('base64url') };
}

test('journal sync preserves notes, symptoms, tags, measurements and reversible archives across an offline restart', async () => {
  const server = service(); const master = client(server, { ...initial, journal: [journalEntry()] }); await create(master);
  const prior = journalEntry({ id: 'synthetic-follower-0001', text: 'Vorheriger synthetischer Stand' });
  const follower = client(server, { ...initial, journal: [prior] }); await follower.engine.join(followerConfig(master));
  assert.deepEqual(follower.box.value.journal, [journalEntry()]);
  assert.deepEqual(JSON.parse(JSON.parse(follower.storage.getItem(HISTORY_KEY))[0].raw).journal, [prior]);
  server.transport.offline = true;
  const archived = archiveEntry([journalEntry()], journalEntry().id, true, '2026-11-16T11:00:00.000Z');
  await edit(master, { ...initial, journal: archived });
  master.engine = master.make(); server.transport.offline = false; await master.engine.tick(); await follower.engine.tick();
  assert.deepEqual(follower.box.value.journal, archived);
  const restored = archiveEntry(archived, archived[0].id, false, '2026-11-16T12:00:00.000Z');
  await edit(master, { ...initial, journal: restored }); await follower.engine.tick();
  assert.deepEqual(follower.box.value.journal, restored);
  assert.throws(() => master.engine.queue(initial), /verlieren/);
  assert.throws(() => follower.engine.queue({ ...initial, journal: restored }), /Master/);
});

test('large journal snapshots encrypt, sync and store in bounded ciphertext chunks', async () => {
  const journal = Array.from({ length: 30 }, (_, i) => journalEntry({ id: `synthetic-entry-${String(i).padStart(4, '0')}`, text: 'Ü'.repeat(3500) }));
  const server = service(); const master = client(server, { ...initial, journal }); await create(master);
  const follower = client(server); await follower.engine.join(followerConfig(master));
  assert.deepEqual(follower.box.value.journal, journal);
  const stored = [...server.rooms.values()][0].storage.map;
  const blobs = [...stored].filter(([key]) => key.startsWith('blob:'));
  assert.ok(blobs.length > 3);
  assert.ok(blobs.every(([, value]) => value.length <= 60000));
  assert.doesNotMatch(JSON.stringify([...stored]), /synthetic-entry|Müdigkeit|weight/);
  const { versions } = await master.engine.history();
  assert.deepEqual((await decryptSnapshot(versions[0].envelope, master.engine.connection)).journal, journal);
});

test('legacy encrypted rooms remain readable, upgrade to journal format, and then reject older writers', async () => {
  const server = service(); const master = client(server); await create(master);
  const c = master.engine.connection;
  const storage = [...server.rooms.values()][0].storage;
  const oldEnvelope = await legacyEnvelope(initial, c);
  const oldVersion = { revision: 1, mutationId: randomToken(), envelope: oldEnvelope, savedAt: new Date().toISOString() };
  const room = storage.map.get('room');
  storage.map.set('room', { ...room, latest: oldVersion });
  storage.map.set('version:000000000001', oldVersion);
  const follower = client(server); await follower.engine.join(followerConfig(master));
  assert.deepEqual(follower.box.value, snapshot(initial));
  assert.deepEqual(await decryptSnapshot(oldEnvelope, c), snapshot(initial));
  await edit(master, { ...initial, journal: [journalEntry()] });
  await assert.rejects(() => master.engine.request(c, 'PUT', { mutationId: randomToken(), baseRevision: 2, envelope: oldEnvelope }), error => error.status === 426);
  const remote = await master.engine.request(c, 'GET');
  assert.equal(remote.revision, 2); assert.deepEqual((await decryptSnapshot(remote.envelope, c)).journal, [journalEntry()]);
  // Altering the declared schema invalidates authentication or validation.
  await assert.rejects(() => decryptSnapshot({ ...remote.envelope, v: 1, schema: undefined }, c));
});

test('ciphertext chunks and receipts expire together after twenty server revisions', async () => {
  const server = service(); const master = client(server, { ...initial, journal: [journalEntry()] }); await create(master);
  for (let i = 0; i < 21; i++) await edit(master, { ...initial, journal: [journalEntry({ text: `Synthetische Fassung ${i}` })] });
  const stored = [...server.rooms.values()][0].storage.map;
  assert.equal([...stored.keys()].filter(key => key.startsWith('version:')).length, 20);
  assert.equal([...stored.keys()].filter(key => key.startsWith('mutation:')).length, 20);
  assert.equal([...stored.keys()].some(key => key.startsWith('blob:000000000001:') || key.startsWith('blob:000000000002:')), false);
});

test('an old app that stripped journal metadata cannot erase the authority after upgrading again', async () => {
  const server = service(); const master = client(server, { ...initial, journal: [journalEntry()] }); await create(master);
  const storage = memory();
  storage.setItem(SYNC_KEY, JSON.stringify({ ...master.engine.connection, published: initial }));
  const oldCache = client(server, initial, storage);
  await edit(oldCache, changed);
  assert.equal(oldCache.engine.connection.conflict, true);
  assert.ok(oldCache.engine.connection.inflight);
  const remote = await master.engine.request(master.engine.connection, 'GET');
  assert.equal(remote.revision, 1); assert.deepEqual((await decryptSnapshot(remote.envelope, master.engine.connection)).journal, [journalEntry()]);
});
