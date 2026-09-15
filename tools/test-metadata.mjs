/**
 * Regression tests for metadata.js (Node, no DOM dependency).
 * Usage: node tools/test-metadata.mjs
 * Covers: XMP packet structure, PNG iTXt injection position/CRC,
 * JPEG APP1 injection position, idempotent skip.
 */
import { buildAiXmp, pngInjectXmp, jpegInjectXmp, injectAiMetadata } from '../js/metadata.js';

let failed = 0;
function ok(cond, msg) {
  console.log(`${cond ? '  ✔' : '  ✘'} ${msg}`);
  if (!cond) failed++;
}

/* ---- Minimal PNG: signature + IHDR + IEND ---- */
function chunk(type, data) {
  const out = new Uint8Array(12 + data.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  // CRC via an independent bitwise implementation (reusing the code under
  // test would be self-confirming)
  let c = 0xffffffff;
  for (let i = 4; i < 8 + data.length; i++) {
    c ^= out[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  c = (c ^ 0xffffffff) >>> 0;
  dv.setUint32(8 + data.length, c);
  return out;
}
const png = new Uint8Array([
  ...[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  ...chunk('IHDR', new Uint8Array(13)),
  ...chunk('IEND', new Uint8Array(0)),
]);

/* ---- Minimal JPEG: SOI + APP0 + fake SOS segment + EOI ---- */
const jpeg = new Uint8Array([
  0xff, 0xd8,
  0xff, 0xe0, 0x00, 0x04, 0x41, 0x42, // APP0 segment (len=4, 2 content bytes)
  0xff, 0xdb, 0x00, 0x04, 0x43, 0x44, // DQT (non-APP; insertion point is before it)
  0xff, 0xd9,
]);

const xmp = buildAiXmp({ tool: 'TEST' });

console.log('XMP packet structure');
ok(xmp.includes('Iptc4xmpExt:DigitalSourceType="http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia"'), 'contains the IPTC DigitalSourceType standard value');
ok(xmp.includes('xmp:CreatorTool="TEST"'), 'contains xmp:CreatorTool');
ok(xmp.startsWith('<?xpacket') && xmp.endsWith('?>'), 'xpacket wrapper intact');

console.log('PNG injection');
const r1 = pngInjectXmp(png, xmp);
ok(r1.injected === true, 'reports injection success');
const dv1 = new DataView(r1.bytes.buffer);
ok(String.fromCharCode(...r1.bytes.subarray(33 + 4, 33 + 8)) === 'iTXt', 'iTXt sits right after IHDR (33 = signature 8 + IHDR chunk 25)');
const dataLen1 = dv1.getUint32(33);
ok(dataLen1 > 0 && dataLen1 < r1.bytes.length, 'length field in a sane range');
ok(r1.bytes.length === png.length + 12 + dataLen1, 'output length = original + full chunk');
// CRC re-check with the independent bitwise algorithm
let c1 = 0xffffffff;
for (let i = 33 + 4; i < 33 + 8 + dataLen1; i++) {
  c1 ^= r1.bytes[i];
  for (let k = 0; k < 8; k++) c1 = c1 & 1 ? 0xedb88320 ^ (c1 >>> 1) : c1 >>> 1;
}
ok(((c1 ^ 0xffffffff) >>> 0) === dv1.getUint32(33 + 8 + dataLen1), 'chunk CRC32 correct');
const r1b = pngInjectXmp(r1.bytes, xmp);
ok(r1b.injected === false && r1b.reason === 'exists', 'second injection skipped idempotently');

console.log('JPEG injection');
const r2 = jpegInjectXmp(jpeg, xmp);
ok(r2.injected === true, 'reports injection success');
ok(r2.bytes[0] === 0xff && r2.bytes[1] === 0xd8, 'SOI preserved');
// Minimal JPEG: SOI(2) + APP0(6) -> insertion point at 8, XMP APP1 starts at 8
ok(r2.bytes[8] === 0xff && r2.bytes[9] === 0xe1, 'XMP APP1 right after the existing APP0 (insertion point 8)');
const ns = 'http://ns.adobe.com/xap/1.0/';
ok(String.fromCharCode(...r2.bytes.subarray(12, 12 + ns.length)) === ns, 'APP1 namespace correct (starts at 8+4)');
ok(r2.bytes[12 + ns.length] === 0, 'namespace terminated by \\0');
const segLen2 = (r2.bytes[10] << 8) | r2.bytes[11];
ok(r2.bytes.length === jpeg.length + 2 + segLen2, 'output length = original + full segment');
ok(String.fromCharCode(...r2.bytes.subarray(13 + ns.length, 13 + ns.length + 20)).startsWith('<?xpacket'), 'XMP packet follows the namespace');
const r2b = jpegInjectXmp(r2.bytes, xmp);
ok(r2b.injected === false && r2b.reason === 'exists', 'second injection skipped idempotently');

console.log('Unified entry dispatch');
ok(injectAiMetadata(png, 'image/png', xmp).injected === true, 'mime=image/png -> PNG path');
ok(injectAiMetadata(jpeg, 'image/jpeg', xmp).injected === true, 'mime=image/jpeg -> JPEG path');
ok(injectAiMetadata(png, 'image/webp', xmp).reason === 'unsupported', 'webp -> unsupported reason');

console.log(failed === 0 ? '\nALL PASSED ✅' : `\n${failed} FAILED ❌`);
process.exit(failed === 0 ? 0 : 1);
