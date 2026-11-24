import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile, access } from 'node:fs/promises';
const source = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
test('PDF engine, local Unicode font and interaction modules remain available offline under a Pages subpath',async()=>{
  const w=worker(); await w.install();
  for(const path of ['src/appointment-pdf.js','src/text-format.js','src/day-press.js','src/vendor/jspdf.umd.min.js','src/vendor/NotoSans-Regular.ttf']) {
    const result=await w.fetch(path);assert.equal(result.url,`https://example.test/bauchgefuehl/${path}`);
  }
});
function worker(scope = 'https://example.test/bauchgefuehl/sw.js') {
  const events = {};
  const entries = new Map();
  const opened = [];
  const downloads = [];
  let skipped = 0;
  let claimed = 0;
  const cache = { async addAll(urls) { for (const request of urls) { downloads.push(request); const url=request.url || request; entries.set(url, { url }); } }, async match(key) { return entries.get(key); } };
  const deleted = [];
  const context = {
    URL, Request, Set, Promise,
    self: { location: { href: scope }, addEventListener(type, cb) { events[type] = cb; }, skipWaiting() { skipped++; }, clients: { async claim() { claimed++; } } },
    caches: { async open(name) { opened.push(name); return cache; }, async keys() { return ['other-app', ...['a','b','c'].map(x => 'bauchgefuehl:/bauchgefuehl/:' + x)]; }, async delete(name) { deleted.push(name); } },
    fetch() { throw new Error('Offline'); },
  };
  vm.runInNewContext(source, context);
  return { entries, opened, downloads, deleted, events, skipped: () => skipped, claimed: () => claimed,
    async install() { let work; events.install({ waitUntil(p) { work = p; } }); await work; },
    fetch(path, { mode = 'cors', method = 'GET' } = {}) { let response; events.fetch({ request: { url: new URL(path, scope).href, mode, method }, respondWith(p) { response = p; } }); return response; },
  };
}
test('all precached files exist and manifest paths remain relative for Pages', async () => {
  const w = worker(); await w.install();
  for (const key of w.entries.keys()) {
    const path = new URL(key).pathname.replace('/bauchgefuehl/', '');
    if (path) await access(new URL('../' + path, import.meta.url));
  }
  const manifest = JSON.parse(await readFile(new URL('../manifest.webmanifest', import.meta.url), 'utf8'));
  assert.equal(manifest.display, 'standalone');
  for (const key of ['id','start_url','scope']) assert.equal(manifest[key], './');
  for (const icon of manifest.icons) {
    const png = await readFile(new URL('../' + icon.src, import.meta.url));
    const [width,height] = icon.sizes.split('x').map(Number);
    assert.equal(png.readUInt32BE(16), width); assert.equal(png.readUInt32BE(20),height);
  }
});
test('offline navigation and modules work at a Pages subpath', async () => {
  const w = worker(); await w.install();
  assert.equal((await w.fetch('./', { mode: 'navigate' })).url, 'https://example.test/bauchgefuehl/index.html');
  assert.equal((await w.fetch('./src/journal-ui.js')).url, 'https://example.test/bauchgefuehl/src/journal-ui.js');
  for (const name of ['development-art.js', 'companion.js', 'companion-ui.js', 'companion-report.js', 'growth.js', 'symptoms.js', 'trends.js', 'backup.js', 'care.js', 'care-ui.js', 'mother.js', 'mother-ui.js', 'checkin.js', 'guide-data.js', 'guide.js', 'guide-ui.js', 'report.js', 'report-ui.js', 'birth.js', 'birth-ui.js', 'device-transfer.js', 'devices-ui.js']) {
    assert.equal((await w.fetch(`./src/${name}`)).url, `https://example.test/bauchgefuehl/src/${name}`);
  }
  assert.ok([...w.entries.keys()].every(url => !url.includes('/images/development')));
  const { weeklyMotif } = await import('../src/development-art.js');
  for (const file of ['knowledge.js', 'knowledge-ui.js', 'transfer-selection.js']) assert.equal((await w.fetch(`./src/${file}`)).url, `https://example.test/bauchgefuehl/src/${file}`);
  const weeklyImages = Array.from({ length: 42 }, (_, index) => weeklyMotif(index + 1).src);
  for (const image of weeklyImages) {
    assert.equal((await w.fetch(image)).url, new URL(image, 'https://example.test/bauchgefuehl/').href);
  }
  assert.match(w.opened[0], /bauchgefuehl:\/bauchgefuehl\/:/);
});
test('sync, credentials in query URLs, third-party and mutation requests bypass the cache', async () => {
  const w = worker(); await w.install();
  for (const path of ['../rooms/private', './rooms/private', './?secret=synthetic', './index.html?secret=synthetic', './styles.css?token=synthetic', 'https://external.test/styles.css', './unknown']) assert.equal(w.fetch(path), undefined, path);
  assert.equal(w.fetch('./index.html', { method: 'POST' }),undefined);
});
test('updates wait for explicit acceptance and prune only older caches in their own scope', async () => {
  const w = worker(); await w.install(); assert.equal(w.skipped(), 0);
  w.events.message({ data: { type: 'UNKNOWN' } }); assert.equal(w.skipped(),0);
  w.events.message({ data: { type: 'ACTIVATE_UPDATE' } }); assert.equal(w.skipped(),1);
  let work; w.events.activate({ waitUntil(p) { work=p; } }); await work;
  assert.equal(w.claimed(),1);
  assert.deepEqual(w.deleted,['bauchgefuehl:/bauchgefuehl/:a','bauchgefuehl:/bauchgefuehl/:b']);
});

test('a release installation bypasses stale HTTP-cache responses for every app file',async()=>{
  const w=worker();await w.install();assert.ok(w.downloads.length>0);
  for(const request of w.downloads){assert.ok(request instanceof Request);assert.equal(request.cache,'reload');assert.equal(new URL(request.url).origin,'https://example.test');}
});
