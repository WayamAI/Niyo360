// Verifies a PNG actually has usable alpha transparency, not just a ".png"
// extension. Parses the file directly (IHDR color type, IDAT scanlines) using
// only Node's built-in zlib/fs -- no new dependency -- because none of the
// custom 3D icons supplied so far have survived a "just trust the extension"
// check: all 19 original renders are JPEGs with a checkerboard baked into
// opaque pixels, and JPEG cannot carry an alpha channel at all.
//
// Usage: node scripts/verify-png-alpha.mjs <path-to-png> [...more paths]
//
// Reports, per file:
//   - Whether it's actually a PNG (magic bytes), not just an extension.
//   - The declared colour type, and whether that type carries alpha
//     (type 4 = grayscale+alpha, type 6 = RGBA; anything else has none).
//   - Width/height from IHDR.
//   - Whether the file contains at least one pixel with alpha < 255, and the
//     minimum alpha value found -- a PNG can declare an alpha channel and
//     still have every pixel fully opaque, which would look identical to a
//     solid background once rendered.
//
// Exits non-zero if any file fails to qualify as a genuinely transparent PNG.

import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const COLOR_TYPE_INFO = {
  0: { name: "grayscale", channels: 1, hasAlpha: false },
  2: { name: "RGB", channels: 3, hasAlpha: false },
  3: { name: "palette", channels: 1, hasAlpha: false },
  4: { name: "grayscale+alpha", channels: 2, hasAlpha: true },
  6: { name: "RGBA", channels: 4, hasAlpha: true },
};

function readChunks(buf) {
  const chunks = [];
  let offset = 8; // past the signature
  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString("ascii", offset + 4, offset + 8);
    const data = buf.subarray(offset + 8, offset + 8 + length);
    chunks.push({ type, data });
    offset += 12 + length; // length + type + data + crc
  }
  return chunks;
}

function unfilter(raw, width, height, channels, bitDepth) {
  if (bitDepth !== 8) {
    throw new Error(`Only 8-bit PNGs are supported by this checker (got ${bitDepth}-bit).`);
  }
  const bpp = channels; // bytes per pixel at 8-bit depth
  const stride = width * channels;
  const out = Buffer.alloc(height * stride);
  let rawOffset = 0;
  for (let y = 0; y < height; y++) {
    const filterType = raw[rawOffset];
    rawOffset += 1;
    const rowStart = y * stride;
    const prevRowStart = (y - 1) * stride;
    for (let x = 0; x < stride; x++) {
      const raw_x = raw[rawOffset + x];
      const a = x >= bpp ? out[rowStart + x - bpp] : 0;
      const b = y > 0 ? out[prevRowStart + x] : 0;
      const c = y > 0 && x >= bpp ? out[prevRowStart + x - bpp] : 0;
      let value;
      switch (filterType) {
        case 0:
          value = raw_x;
          break;
        case 1:
          value = raw_x + a;
          break;
        case 2:
          value = raw_x + b;
          break;
        case 3:
          value = raw_x + Math.floor((a + b) / 2);
          break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          const pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
          value = raw_x + pred;
          break;
        }
        default:
          throw new Error(`Unknown PNG filter type ${filterType} at row ${y}.`);
      }
      out[rowStart + x] = value & 0xff;
    }
    rawOffset += stride;
  }
  return out;
}

function verify(path) {
  const result = { path, ok: false, reasons: [] };
  let buf;
  try {
    buf = readFileSync(path);
  } catch (err) {
    result.reasons.push(`Could not read file: ${err.message}`);
    return result;
  }

  if (!buf.subarray(0, 8).equals(PNG_SIGNATURE)) {
    result.reasons.push(
      "Not a PNG file (magic bytes do not match) -- extension alone is not proof.",
    );
    return result;
  }

  const chunks = readChunks(buf);
  const ihdr = chunks.find((c) => c.type === "IHDR");
  if (!ihdr) {
    result.reasons.push("No IHDR chunk found -- malformed PNG.");
    return result;
  }

  const width = ihdr.data.readUInt32BE(0);
  const height = ihdr.data.readUInt32BE(4);
  const bitDepth = ihdr.data.readUInt8(8);
  const colorType = ihdr.data.readUInt8(9);
  result.width = width;
  result.height = height;
  result.bitDepth = bitDepth;
  result.colorType = colorType;

  const info = COLOR_TYPE_INFO[colorType];
  if (!info) {
    result.reasons.push(`Unrecognized PNG colour type ${colorType}.`);
    return result;
  }
  result.colorTypeName = info.name;

  if (!info.hasAlpha) {
    result.reasons.push(
      `Colour type is "${info.name}" (type ${colorType}) -- this PNG has no alpha channel at all, same defect class as the original JPEGs.`,
    );
    return result;
  }

  const idatChunks = chunks.filter((c) => c.type === "IDAT");
  if (idatChunks.length === 0) {
    result.reasons.push("No IDAT chunk found -- malformed PNG.");
    return result;
  }
  const compressed = Buffer.concat(idatChunks.map((c) => c.data));

  let raw;
  try {
    raw = inflateSync(compressed);
  } catch (err) {
    result.reasons.push(`Could not decompress IDAT: ${err.message}`);
    return result;
  }

  let pixels;
  try {
    pixels = unfilter(raw, width, height, info.channels, bitDepth);
  } catch (err) {
    result.reasons.push(err.message);
    return result;
  }

  const alphaOffset = info.channels - 1; // last channel
  let minAlpha = 255;
  let transparentPixelCount = 0;
  const totalPixels = width * height;
  for (let i = 0; i < totalPixels; i++) {
    const alpha = pixels[i * info.channels + alphaOffset];
    if (alpha < minAlpha) minAlpha = alpha;
    if (alpha === 0) transparentPixelCount++;
  }
  result.minAlpha = minAlpha;
  result.transparentPixelCount = transparentPixelCount;
  result.transparentPixelFraction = transparentPixelCount / totalPixels;

  if (minAlpha === 255) {
    result.reasons.push(
      "PNG declares an alpha channel but every pixel is fully opaque (alpha=255 everywhere) -- this would render identically to a solid background.",
    );
    return result;
  }

  if (transparentPixelCount === 0) {
    result.reasons.push(
      "No fully-transparent (alpha=0) pixels found -- acceptable for a soft-edged icon with only partial alpha, but worth a visual check that the background area is actually clear, not just translucent.",
    );
    // Not a hard failure on its own -- partial alpha at edges is normal
    // anti-aliasing -- but flagged for a human to glance at.
  }

  result.ok = true;
  return result;
}

const paths = process.argv.slice(2);
if (paths.length === 0) {
  console.error("Usage: node scripts/verify-png-alpha.mjs <path-to-png> [...more paths]");
  process.exit(2);
}

let anyFailed = false;
for (const path of paths) {
  const r = verify(path);
  console.log(`\n${path}`);
  if (r.width != null) {
    console.log(
      `  ${r.width}x${r.height}, ${r.bitDepth}-bit, colour type ${r.colorType} (${r.colorTypeName})`,
    );
  }
  if (r.minAlpha != null) {
    console.log(
      `  min alpha found: ${r.minAlpha}/255 | fully-transparent pixels: ${r.transparentPixelCount} (${(r.transparentPixelFraction * 100).toFixed(2)}%)`,
    );
  }
  if (r.ok) {
    console.log("  PASS: genuine alpha channel present, with at least one non-opaque pixel.");
  } else {
    anyFailed = true;
    console.log("  FAIL:");
    for (const reason of r.reasons) console.log(`    - ${reason}`);
  }
}

process.exit(anyFailed ? 1 : 0);
