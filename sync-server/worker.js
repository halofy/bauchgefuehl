const TOKEN_HASH = /^[a-f0-9]{64}$/;
const ID = /^[A-Za-z0-9_-]{32,64}$/;
const reply = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const hash = async token => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)))].map(x => x.toString(16).padStart(2, '0')).join('');
function equal(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}
function validEnvelope(e) {
  return (e?.v === 1 || (e?.v === 2 && e.schema === 3)) && typeof e.iv === 'string' && /^[A-Za-z0-9_-]{16}$/.test(e.iv) && typeof e.data === 'string' && /^[A-Za-z0-9_-]{22,720000}$/.test(e.data);
}
const revisionKey = revision => String(revision).padStart(12, '0');
const schemaOf = envelope => envelope.v === 2 ? envelope.schema : 2;
async function storeVersion(tx, version) {
  const text = JSON.stringify(version.envelope);
  const chunks = Math.ceil(text.length / 60000);
  for (let i = 0; i < chunks; i++) await tx.put(`blob:${revisionKey(version.revision)}:${i}`, text.slice(i * 60000, (i + 1) * 60000));
  const { envelope, ...metadata } = version;
  const saved = { ...metadata, envelopeParts: chunks, schema: schemaOf(envelope) };
  await tx.put(`version:${revisionKey(version.revision)}`, saved);
  return saved;
}
async function loadVersion(tx, metadata) {
  if (metadata.envelope) return metadata; // Existing rooms keep their saved data.
  const parts = [];
  for (let i = 0; i < metadata.envelopeParts; i++) {
    const part = await tx.get(`blob:${revisionKey(metadata.revision)}:${i}`);
    if (typeof part !== 'string') throw new Error('Unvollständiger Serverstand.');
    parts.push(part);
  }
  return { revision: metadata.revision, mutationId: metadata.mutationId, savedAt: metadata.savedAt, envelope: JSON.parse(parts.join('')) };
}
async function body(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('body');
  let size = 0;
  const parts = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 750000) { await reader.cancel(); throw new Error('size'); }
    parts.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) { bytes.set(part, offset); offset += part.length; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

// A single durable, transactional authority per room. No health plaintext is stored.
export class SyncRoom {
  constructor(state) { this.storage = state.storage; }
  async fetch(request) {
    const url = new URL(request.url);
    let input;
    try { if (request.method === 'POST' || request.method === 'PUT') input = await body(request); }
    catch { return reply({ error: 'Ungültige oder zu große Anfrage.' }, 400); }
    return this.storage.transaction(async tx => {
      const room = await tx.get('room');
      if (request.method === 'POST') {
        // The outer Worker authorizes creation; the DO binding is not public.
        if (room) return reply({ error: 'Dieser Raum existiert bereits.' }, 409);
        if (!TOKEN_HASH.test(input?.readHash) || !TOKEN_HASH.test(input?.writeHash) || !ID.test(input?.mutationId) || !validEnvelope(input?.envelope)) return reply({ error: 'Ungültiger Raum.' }, 400);
        const latest = { revision: 1, mutationId: input.mutationId, envelope: input.envelope, savedAt: new Date().toISOString() };
        const metadata = await storeVersion(tx, latest);
        await tx.put('room', { readHash: input.readHash, writeHash: input.writeHash, latest: metadata });
        await tx.put(`mutation:${input.mutationId}`, 1);
        return reply({ revision: 1 }, 201);
      }
      if (!room) return reply({ error: 'Raum nicht gefunden. Lokale Daten bleiben erhalten.' }, 404);
      const token = request.headers.get('Authorization')?.replace(/^Bearer /, '') || '';
      if (!ID.test(token)) return reply({ error: 'Zugriff verweigert.' }, 401);
      const digest = await hash(token);
      const master = equal(digest, room.writeHash);
      if (!master && !equal(digest, room.readHash)) return reply({ error: 'Zugriff verweigert.' }, 401);
      if (request.method === 'GET') {
        if (url.searchParams.has('history')) {
          if (!master) return reply({ error: 'Nur der Master darf den Verlauf laden.' }, 403);
          const versions = [];
          for (const version of (await tx.list({ prefix: 'version:' })).values()) versions.push(await loadVersion(tx, version));
          return reply({ versions });
        }
        if (request.headers.get('If-None-Match') === `"${room.latest.revision}"`) return new Response(null, { status: 304, headers: { 'Cache-Control': 'no-store' } });
        return reply(await loadVersion(tx, room.latest));
      }
      if (request.method !== 'PUT') return reply({ error: 'Methode nicht erlaubt.' }, 405);
      if (!master) return reply({ error: 'Dieses Gerät hat nur Leserechte.' }, 403);
      if (!ID.test(input?.mutationId) || !Number.isSafeInteger(input?.baseRevision) || !validEnvelope(input?.envelope)) return reply({ error: 'Ungültiger Stand.' }, 400);
      // Idempotent retry even when a save succeeded but its response was lost.
      const receipt = await tx.get(`mutation:${input.mutationId}`);
      if (receipt !== undefined) return reply({ revision: receipt });
      const currentSchema = room.latest.schema ?? schemaOf(room.latest.envelope);
      if (schemaOf(input.envelope) < currentSchema) return reply({ error: 'Bitte die App aktualisieren. Ein älteres Format darf das Journal nicht überschreiben.' }, 426);
      if (input.baseRevision !== room.latest.revision) return reply({ error: 'Versionskonflikt. Keine Daten wurden überschrieben.', revision: room.latest.revision }, 409);
      const revision = room.latest.revision + 1;
      const latest = { revision, mutationId: input.mutationId, envelope: input.envelope, savedAt: new Date().toISOString() };
      const metadata = await storeVersion(tx, latest);
      await tx.put('room', { ...room, latest: metadata });
      await tx.put(`mutation:${input.mutationId}`, revision);
      if (revision > 20) {
        const key = `version:${String(revision - 20).padStart(12, '0')}`;
        const old = await tx.get(key);
        for (let i = 0; i < (old?.envelopeParts || 0); i++) await tx.delete(`blob:${revisionKey(revision - 20)}:${i}`);
        await tx.delete(key);
        if (old) await tx.delete(`mutation:${old.mutationId}`);
      }
      return reply({ revision });
    });
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    const cors = { 'Access-Control-Allow-Origin': origin, Vary: 'Origin', 'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS', 'Access-Control-Allow-Headers': 'Authorization, Content-Type, If-None-Match', 'Cache-Control': 'no-store' };
    if (!origin || !allowed.includes(origin)) return reply({ error: 'Diese App-Adresse ist nicht zugelassen.' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    let response;
    try {
      const url = new URL(request.url);
      const match = url.pathname.match(/^\/rooms\/([A-Za-z0-9_-]{32,64})$/);
      if (!match) response = reply({ error: 'Nicht gefunden.' }, 404);
      else if (request.method === 'POST' && (!env.ADMIN_TOKEN || !equal(request.headers.get('Authorization'), `Bearer ${env.ADMIN_TOKEN}`))) response = reply({ error: 'Einrichtungsschlüssel fehlt oder ist ungültig.' }, 401);
      else {
        const id = env.ROOMS.idFromName(match[1]);
        response = await env.ROOMS.get(id).fetch(request);
      }
    } catch { response = reply({ error: 'Sync-Dienst vorübergehend nicht erreichbar. Lokale Daten bleiben erhalten.' }, 503); }
    const result = new Response(response.body, response);
    for (const [name, value] of Object.entries(cors)) result.headers.set(name, value);
    return result;
  },
};
