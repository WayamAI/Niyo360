// Pre-renders the index page so Vercel can serve the TanStack Start client as
// a static SPA. The default build emits a Cloudflare Worker (dist/server/) but
// no dist/client/index.html — without one Vercel returns 404 and a hand-rolled
// shell makes the router invariant-fail at hydration time.
//
// We import the built worker into Node (its fetch signature is web-standard)
// and call it for "/" to obtain the same HTML the Cloudflare deployment would
// serve. That HTML carries the hydration data the client bundle needs, and the
// asset URLs are already root-relative.

import { writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { pathToFileURL } from "node:url";

const WORKER = resolve("dist/server/index.js");
const OUT = resolve("dist/client/index.html");

if (!existsSync(WORKER)) {
  console.error(`[fix-vercel-static] ${WORKER} not found — did vite build run?`);
  process.exit(1);
}

const worker = (await import(pathToFileURL(WORKER).href)).default;
if (!worker || typeof worker.fetch !== "function") {
  console.error("[fix-vercel-static] built worker does not expose a default { fetch } export");
  process.exit(1);
}

const request = new Request("http://localhost/");
const ctx = { waitUntil: () => {}, passThroughOnException: () => {} };

let response;
try {
  response = await worker.fetch(request, {}, ctx);
} catch (err) {
  console.error("[fix-vercel-static] worker.fetch threw:", err);
  process.exit(1);
}

if (response.status !== 200) {
  console.error(`[fix-vercel-static] worker returned HTTP ${response.status} for /`);
  process.exit(1);
}

const html = await response.text();

if (!existsSync(dirname(OUT))) {
  console.error(`[fix-vercel-static] ${dirname(OUT)} missing — vite build did not produce client output`);
  process.exit(1);
}

await writeFile(OUT, html, "utf8");
console.log(`[fix-vercel-static] wrote ${OUT} (${html.length} bytes, SSR-rendered)`);
