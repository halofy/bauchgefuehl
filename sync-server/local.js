import http from 'node:http';
import https from 'node:https';
import { readFile, mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import worker, { SyncRoom } from './worker.js';
import { openStorage } from './sqlite-storage.js';

const project = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
function option(name, fallback) {
  const index = args.indexOf(name);
  if (index < 0) return fallback;
  if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`Wert für ${name} fehlt.`);
  return args[index + 1];
}
const dataPath = path.resolve(option('--data', path.join(project, '.local-sync')));
const staticPath = path.join(project, 'dist');
if (dataPath === staticPath || dataPath.startsWith(staticPath + path.sep)) throw new Error('Der Datenspeicher darf nicht im öffentlichen dist-Verzeichnis liegen.');
const host = option('--host', '127.0.0.1');
const port = Number(option('--port', '4173'));
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Ungültiger Port.');
const certPath = option('--cert', null);
const keyPath = option('--key', null);
if (!!certPath !== !!keyPath) throw new Error('--cert und --key werden gemeinsam benötigt.');
if (!certPath && !['127.0.0.1', 'localhost', '::1'].includes(host)) throw new Error('Für andere Geräte im Netzwerk bitte HTTPS mit --cert und --key sowie --origin konfigurieren.');
const defaultOrigin = `${certPath ? 'https' : 'http'}://${host === '::1' ? '[::1]' : host}:${port}`;
const origin = new URL(option('--origin', defaultOrigin)).origin;
if (!certPath && (new URL(origin).protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(new URL(origin).hostname))) throw new Error('HTTP ist nur für Loopback-Adressen auf diesem Rechner vorgesehen.');
if (certPath && !origin.startsWith('https://')) throw new Error('Die veröffentlichte lokale Adresse muss HTTPS verwenden.');
if (host === '0.0.0.0' && !args.includes('--origin')) throw new Error('--origin muss die erreichbare HTTPS-Adresse im Netzwerk angeben.');
const origins = new Set([origin]);
if (!certPath && ['127.0.0.1', 'localhost'].includes(host)) {
  origins.add(`http://localhost:${port}`); origins.add(`http://127.0.0.1:${port}`);
}
const hosts = new Set([...origins].map(value => new URL(value).host));
await mkdir(dataPath, { recursive: true, mode: 0o700 });
const adminPath = path.join(dataPath, 'admin-token');
let admin;
try { admin = (await readFile(adminPath, 'utf8')).trim(); }
catch (error) {
  if (error.code !== 'ENOENT') throw error;
  admin = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url');
  await writeFile(adminPath, admin + '\n', { flag: 'wx', mode: 0o600 });
}
if (admin.length < 32) throw new Error('Der Einrichtungsschlüssel ist ungültig. Die vorhandene Datei wird nicht überschrieben.');
const store = openStorage(path.join(dataPath, 'sync.sqlite'));
if (args.includes('--backup')) {
  const destination = path.join(dataPath, 'backups');
  await mkdir(destination, { recursive: true, mode: 0o700 });
  const name = path.join(destination, `sync-${new Date().toISOString().replaceAll(':', '-')}.sqlite`);
  store.db.prepare('VACUUM INTO ?').run(name);
  await store.close();
  console.log(`Konsistente Datenbank-Sicherung erstellt: ${name}`);
  process.exit(0);
}
await access(path.join(staticPath, 'index.html'));
const rooms = new Map();
const env = { ADMIN_TOKEN: admin, ALLOWED_ORIGINS: [...origins].join(','), ROOMS: {
  idFromName: name => name,
  get(name) {
    if (!rooms.has(name)) rooms.set(name, new SyncRoom({ storage: store.forRoom(name) }));
    return rooms.get(name);
  },
} };
const types = { '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8' };
async function handler(req, res) {
  try {
    // Reject unexpected Host headers; do not trust arbitrary DNS-rebinding hosts.
    if (!hosts.has(req.headers.host)) { res.writeHead(403); res.end('Nicht zugelassene Adresse.'); return; }
    const base = `${certPath ? 'https' : 'http'}://${req.headers.host}`;
    const url = new URL(req.url, base);
    if (url.origin !== base) { res.writeHead(403); res.end(); return; }
    if (url.pathname.startsWith('/rooms/')) {
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) if (typeof value === 'string') headers.set(key, value);
      // Same-origin browser GETs may omit Origin; authenticated requests still
      // require a room token, and Host has already been allowlisted.
      if (!headers.has('Origin')) headers.set('Origin', base);
      const init = { method: req.method, headers };
      if (!['GET', 'HEAD'].includes(req.method)) { init.body = Readable.toWeb(req); init.duplex = 'half'; }
      const response = await worker.fetch(new Request(url, init), env);
      res.writeHead(response.status, Object.fromEntries(response.headers));
      if (response.body) for await (const chunk of response.body) res.write(chunk);
      res.end(); return;
    }
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
    const decoded = decodeURIComponent(url.pathname);
    const target = path.resolve(staticPath, '.' + (decoded === '/' ? '/index.html' : decoded));
    if (!target.startsWith(staticPath + path.sep) || decoded.includes('\\')) { res.writeHead(403); res.end(); return; }
    let data = await readFile(target);
    if (target.endsWith('/index.html')) {
      // No secrets are injected; the browser only learns the local service URL.
      data = Buffer.from(data.toString().replace('</head>', `<meta name="local-sync-endpoint" content="${base}"></head>`));
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch (error) {
    res.writeHead(error.code === 'ENOENT' ? 404 : 500); res.end('Anfrage konnte nicht verarbeitet werden.');
  }
}
const server = certPath ? https.createServer({ cert: await readFile(certPath), key: await readFile(keyPath) }, handler) : http.createServer(handler);
server.listen(port, host, () => {
  console.log(`Lokale Webapp und Sync-Dienst: ${origin}`);
  console.log(`Dauerhafter Datenspeicher: ${dataPath}`);
  console.log(`Einrichtungsschlüssel zum Kopieren in den Master-Dialog: ${adminPath}`);
});
let stopping = false;
async function stop() {
  if (stopping) return; stopping = true;
  server.close(async () => { await store.close(); process.exit(0); });
  server.closeIdleConnections();
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
