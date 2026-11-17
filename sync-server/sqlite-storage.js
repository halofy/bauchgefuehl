import { DatabaseSync } from 'node:sqlite';

export function openStorage(filename) {
  const db = new DatabaseSync(filename);
  db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS kv (room TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL, PRIMARY KEY (room, key)) WITHOUT ROWID;');
  const get = db.prepare('SELECT value FROM kv WHERE room = ? AND key = ?');
  const put = db.prepare('INSERT INTO kv(room,key,value) VALUES(?,?,?) ON CONFLICT(room,key) DO UPDATE SET value=excluded.value');
  const remove = db.prepare('DELETE FROM kv WHERE room = ? AND key = ?');
  const list = db.prepare('SELECT key,value FROM kv WHERE room = ? AND key >= ? AND key < ? ORDER BY key');
  let tail = Promise.resolve();
  return {
    db,
    async close() { await tail; db.close(); },
    forRoom(room) {
      return { transaction(action) {
        const run = tail.then(async () => {
          db.exec('BEGIN IMMEDIATE');
          try {
            const result = await action({
              async get(key) { const row = get.get(room, key); return row ? JSON.parse(row.value) : undefined; },
              async put(key, value) { put.run(room, key, JSON.stringify(value)); },
              async delete(key) { remove.run(room, key); },
              async list({ prefix }) { return new Map(list.all(room, prefix, prefix + '\uffff').map(row => [row.key, JSON.parse(row.value)])); },
            });
            db.exec('COMMIT');
            return result;
          } catch (error) { db.exec('ROLLBACK'); throw error; }
        });
        tail = run.catch(() => {});
        return run;
      } };
    },
  };
}
