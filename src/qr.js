import { qrcodegen } from './vendor/qrcodegen.js';

// Generated from the link in memory; never sent to a QR service.
export function createQrSvg(text) {
  if (typeof text !== 'string' || !text.length) throw new Error('Ein Link für den QR-Code fehlt.');
  const qr = qrcodegen.QrCode.encodeText(text, qrcodegen.QrCode.Ecc.MEDIUM);
  const border = 4;
  const size = qr.size + border * 2;
  const parts = [];
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      if (qr.getModule(x, y)) parts.push(`M${x + border},${y + border}h1v1h-1z`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="QR-Code zum Öffnen dieser Schwangerschaftsangaben auf einem anderen Gerät" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/><path d="${parts.join('')}" fill="#000"/></svg>`;
}
