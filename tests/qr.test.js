import test from 'node:test';
import assert from 'node:assert/strict';
import { createQrSvg } from '../src/qr.js';
import { qrcodegen } from '../src/vendor/qrcodegen.js';
import { encodeShare } from '../src/pregnancy.js';

test('share links for both calculation methods render locally as accessible square QR SVGs', () => {
  for (const profile of [{ method: 'period', lmp: '2026-07-09', cycle: 30 }, { method: 'due-date', dueDate: '2027-04-17' }]) {
    const url = `https://example.github.io/calculator/#s=${encodeShare(profile, '2026-11-17')}`;
    const svg = createQrSvg(url);
    assert.match(svg, /role="img" aria-label="QR-Code/);
    assert.match(svg, /shape-rendering="crispEdges"/);
    const [, width, height] = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
    assert.equal(width, height);
    assert.match(svg, /fill="#fff"/);
    assert.match(svg, /fill="#000"/);
    assert.doesNotMatch(svg, /https:\/\/example|script|foreignObject|image|href=/);
  }
});

test('QR serialization preserves every module with a four-module quiet zone', () => {
  const text = 'https://example.github.io/calculator/#s=test';
  const qr = qrcodegen.QrCode.encodeText(text, qrcodegen.QrCode.Ecc.MEDIUM);
  const svg = createQrSvg(text);
  assert.ok(svg.includes(`viewBox="0 0 ${qr.size + 8} ${qr.size + 8}"`));
  const positions = new Set([...svg.matchAll(/M(\d+),(\d+)h1v1h-1z/g)].map(m => `${m[1]},${m[2]}`));
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) assert.equal(positions.has(`${x + 4},${y + 4}`), qr.getModule(x, y));
  }
  for (const point of positions) {
    const [x, y] = point.split(',').map(Number);
    assert.ok(x >= 4 && x < qr.size + 4 && y >= 4 && y < qr.size + 4);
  }
});

test('QR payload cannot introduce markup and failures are explicit', () => {
  const svg = createQrSvg('</svg><script>alert(1)</script>');
  assert.doesNotMatch(svg, /<script|alert|<\/svg><svg/);
  assert.throws(() => createQrSvg(''), /fehlt/);
  assert.throws(() => createQrSvg(null), /fehlt/);
  assert.throws(() => createQrSvg('x'.repeat(10000)));
});
