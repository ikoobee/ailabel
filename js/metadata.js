/**
 * Implicit AI-content metadata labeling — plain JS, zero dependencies.
 *
 * What it does: writes the standard "AI-generated" metadata fields (XMP)
 * into the output image bytes:
 *   - Iptc4xmpExt:DigitalSourceType = .../trainedAlgorithmicMedia
 *     (the IPTC international-standard value for AI-generated media,
 *     readable by mainstream libraries and toolchains)
 *   - xmp:CreatorTool (name of the tool applying the label)
 *
 * How (dispatched by container):
 *   - PNG: parse the chunk structure, insert an iTXt chunk right after IHDR
 *     (keyword = "XML:com.adobe.xmp", the standard XMP-in-PNG embedding),
 *     with a valid CRC32;
 *   - JPEG: walk the segment structure, insert an XMP APP1 segment after
 *     SOI and any existing APP0/APP1 segments
 *     (namespace "http://ns.adobe.com/xap/1.0/\0");
 *   - WebP: not written in v1 (the visible label still applies); callers
 *     surface the skip reason.
 *
 * Idempotent: skips writing when the target already exists
 * (injected:false, reason:'exists').
 * Legal note: this module is a technical implementation; the tool page
 * must state that it is an aid, not legal advice.
 */

/* ---------- CRC32 (PNG chunk checksum) ---------- */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes, start, end) {
  let c = 0xffffffff;
  for (let i = start; i < end; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/* ---------- XMP packet construction ---------- */

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Build the AI-generation XMP packet.
 * @param {{ tool?: string }} opts tool goes into xmp:CreatorTool
 */
export function buildAiXmp(opts = {}) {
  const tool = xmlEscape(opts.tool || 'AI Labeler');
  return [
    '<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>',
    '<x:xmpmeta xmlns:x="adobe:ns:meta/">',
    ' <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">',
    '  <rdf:Description rdf:about=""',
    '    xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/"',
    '    xmlns:xmp="http://ns.adobe.com/xap/1.0/"',
    '    Iptc4xmpExt:DigitalSourceType="http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia"',
    `    xmp:CreatorTool="${tool}"/>`,
    ' </rdf:RDF>',
    '</x:xmpmeta>',
    '<?xpacket end="w"?>',
  ].join('\n');
}

/* ---------- PNG: iTXt injection ---------- */

const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const XMP_KEYWORD = 'XML:com.adobe.xmp';

/**
 * Whether the PNG bytes already contain an XMP iTXt chunk.
 */
function pngHasXmp(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  let pos = 8; // skip the signature
  while (pos + 8 <= u8.length) {
    const len = dv.getUint32(pos);
    const type = String.fromCharCode(u8[pos + 4], u8[pos + 5], u8[pos + 6], u8[pos + 7]);
    if (type === 'iTXt') {
      // keyword is \0-terminated; compare the prefix
      for (let i = 0; i < XMP_KEYWORD.length; i++) {
        if (u8[pos + 8 + i] !== XMP_KEYWORD.charCodeAt(i)) break;
        if (i === XMP_KEYWORD.length - 1 && u8[pos + 8 + i + 1] === 0) return true;
      }
    }
    if (type === 'IEND') break;
    pos += 12 + len; // len + type + data + crc
  }
  return false;
}

/**
 * Insert an XMP iTXt chunk right after IHDR.
 * @returns {{ bytes: Uint8Array, injected: boolean, reason?: string }}
 */
export function pngInjectXmp(u8, xmpString) {
  for (let i = 0; i < 8; i++) {
    if (u8[i] !== PNG_SIG[i]) return { bytes: u8, injected: false, reason: 'not-png' };
  }
  if (pngHasXmp(u8)) return { bytes: u8, injected: false, reason: 'exists' };

  // iTXt data = keyword + 5 zero bytes + xmp
  //   (keyword\0 + compressionFlag=0 + compressionMethod=0 + lang""\0 + translated""\0)
  const enc = new TextEncoder();
  const kwBytes = enc.encode(XMP_KEYWORD);
  const xmpBytes = enc.encode(xmpString);
  const data = new Uint8Array(kwBytes.length + 5 + xmpBytes.length);
  data.set(kwBytes, 0);
  for (let i = 0; i < 5; i++) data[kwBytes.length + i] = 0;
  data.set(xmpBytes, kwBytes.length + 5);

  // chunk = len(4) + "iTXt"(4) + data + crc32(type+data)(4)
  const chunk = new Uint8Array(12 + data.length);
  const cdv = new DataView(chunk.buffer);
  cdv.setUint32(0, data.length);
  chunk[4] = 0x69; chunk[5] = 0x54; chunk[6] = 0x58; chunk[7] = 0x74; // "iTXt" (capital T)
  chunk.set(data, 8);
  cdv.setUint32(8 + data.length, crc32(chunk, 4, 8 + data.length));

  // Insertion point: right after IHDR (PNG spec requires IHDR as first chunk)
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const ihdrLen = dv.getUint32(8);
  const insertAt = 8 + 12 + ihdrLen;

  const out = new Uint8Array(u8.length + chunk.length);
  out.set(u8.subarray(0, insertAt), 0);
  out.set(chunk, insertAt);
  out.set(u8.subarray(insertAt), insertAt + chunk.length);
  return { bytes: out, injected: true };
}

/* ---------- JPEG: APP1 XMP injection ---------- */

const XAP_NS = 'http://ns.adobe.com/xap/1.0/';

function bytesStartsWith(u8, start, str) {
  for (let i = 0; i < str.length; i++) {
    if (u8[start + i] !== str.charCodeAt(i)) return false;
  }
  return true;
}

/**
 * Whether the JPEG bytes already contain an XMP APP1 segment.
 */
function jpegHasXmp(u8) {
  let pos = 2; // skip SOI
  while (pos + 4 <= u8.length) {
    if (u8[pos] !== 0xff) return false;
    const marker = u8[pos + 1];
    if (marker === 0xe1) {
      if (bytesStartsWith(u8, pos + 4, XAP_NS) && u8[pos + 4 + XAP_NS.length] === 0) return true;
    }
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd9)) return false; // standalone marker, abnormal path
    const segLen = (u8[pos + 2] << 8) | u8[pos + 3];
    pos += 2 + segLen;
  }
  return false;
}

/**
 * Insert an XMP APP1 segment after SOI and any existing APP0/APP1 segments
 * (a safe position — XMP must not precede the EXIF APP1).
 * @returns {{ bytes: Uint8Array, injected: boolean, reason?: string }}
 */
export function jpegInjectXmp(u8, xmpString) {
  if (u8[0] !== 0xff || u8[1] !== 0xd8) return { bytes: u8, injected: false, reason: 'not-jpeg' };
  if (jpegHasXmp(u8)) return { bytes: u8, injected: false, reason: 'exists' };

  // Segment payload = namespace + \0 + XMP packet
  const enc = new TextEncoder();
  const nsBytes = enc.encode(XAP_NS);
  const xmpBytes = enc.encode(xmpString);
  const payloadLen = nsBytes.length + 1 + xmpBytes.length; // +1 for the namespace's trailing \0
  const segLen = 2 + payloadLen; // length field includes its own 2 bytes

  // Find the insertion point: skip existing APP0(0xE0)/APP1(0xE1)
  let pos = 2;
  while (pos + 4 <= u8.length && u8[pos] === 0xff) {
    const marker = u8[pos + 1];
    if (marker !== 0xe0 && marker !== 0xe1) break;
    pos += 2 + ((u8[pos + 2] << 8) | u8[pos + 3]);
  }

  // Segment bytes on the wire = marker(2) + length field (incl. its own 2 bytes) = 4 + payloadLen
  const seg = new Uint8Array(4 + payloadLen);
  seg[0] = 0xff; seg[1] = 0xe1;
  const sdv = new DataView(seg.buffer);
  sdv.setUint16(2, segLen);
  seg.set(nsBytes, 4);
  seg[4 + nsBytes.length] = 0;
  seg.set(xmpBytes, 5 + nsBytes.length);

  const out = new Uint8Array(u8.length + seg.length);
  out.set(u8.subarray(0, pos), 0);
  out.set(seg, pos);
  out.set(u8.subarray(pos), pos + seg.length);
  return { bytes: out, injected: true };
}

/* ---------- Unified entry ---------- */

/**
 * Dispatch injection by MIME type.
 * @returns {{ bytes: Uint8Array, injected: boolean, reason?: string }}
 */
export function injectAiMetadata(u8, mime, xmpString) {
  if (mime === 'image/png') return pngInjectXmp(u8, xmpString);
  if (mime === 'image/jpeg') return jpegInjectXmp(u8, xmpString);
  return { bytes: u8, injected: false, reason: 'unsupported' }; // webp etc. not written in v1
}
