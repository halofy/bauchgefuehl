// Reproducible, dependency-free raster versions of the existing leaf brand.
import { mkdir, writeFile } from 'node:fs/promises';
import { deflateSync } from 'node:zlib';
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]);
  const size = Buffer.alloc(4); size.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([size, body, crc]);
}
function leaf(x, y, cx, cy, angle) {
  const dx = x - cx, dy = y - cy;
  const a = dx * Math.cos(angle) + dy * Math.sin(angle);
  const b = -dx * Math.sin(angle) + dy * Math.cos(angle);
  return Math.abs(a) < 11 && Math.abs(b) < 5 * Math.sin(Math.PI * (a + 11) / 22);
}
function png(size) {
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let coverage = 0;
    for (let sy = 0; sy < 2; sy++) for (let sx = 0; sx < 2; sx++) {
      const px = (x + (sx + .5) / 2) / size * 100;
      const py = (y + (sy + .5) / 2) / size * 100;
      if ((Math.abs(px - 50) < 1.4 && py > 39 && py < 73) || leaf(px, py, 41, 49, .85) || leaf(px, py, 59, 38, -.85)) coverage++;
    }
    const offset = y * (size * 3 + 1) + 1 + x * 3;
    [40,77,64].forEach((value,i) => { raw[offset+i] = Math.round(value + ([247,244,235][i] - value) * coverage / 4); });
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(size,0); header.writeUInt32BE(size,4); header[8]=8; header[9]=2;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
}
await mkdir('icons', { recursive: true });
for (const [name,size] of [['icon-192',192],['icon-512',512],['maskable-512',512],['apple-touch-icon',180]]) await writeFile(`icons/${name}.png`,png(size));
