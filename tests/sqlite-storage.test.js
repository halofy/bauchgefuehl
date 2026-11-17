import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { openStorage } from '../sync-server/sqlite-storage.js';

test('local SQLite state survives closing and reopening the service', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'bauchgefuehl-sqlite-'));
  const file = path.join(directory, 'sync.sqlite');
  let store = openStorage(file);
  try {
    await store.forRoom('master-room').transaction(async tx => {
      await tx.put('room', { revision: 3, encrypted: 'synthetic-ciphertext' });
      await tx.put('version:001', { revision: 1 });
    });
    await store.close();
    store = openStorage(file);
    await store.forRoom('master-room').transaction(async tx => {
      assert.equal((await tx.get('room')).revision, 3);
      assert.equal((await tx.list({ prefix: 'version:' })).size, 1);
    });
    await store.forRoom('other-room').transaction(async tx => { assert.equal(await tx.get('room'), undefined); });
  } finally { await store.close(); await rm(directory, { recursive: true }); }
});

test('failed local transactions roll back and concurrent transactions serialize', async () => {
  const store = openStorage(':memory:');
  const room = store.forRoom('one');
  try {
    await assert.rejects(() => room.transaction(async tx => { await tx.put('count', 100); throw new Error('Simulated failure'); }));
    await room.transaction(async tx => { assert.equal(await tx.get('count'), undefined); await tx.put('count', 0); });
    await Promise.all(Array.from({ length: 10 }, () => room.transaction(async tx => { const n = await tx.get('count'); await tx.put('count', n + 1); })));
    await room.transaction(async tx => { assert.equal(await tx.get('count'), 10); });
  } finally { await store.close(); }
});
