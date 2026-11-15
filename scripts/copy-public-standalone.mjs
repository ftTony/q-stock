#!/usr/bin/env node
/**
 * `next build` standalone output only includes public/ files reached by
 * import tracing — files referenced solely at runtime (offline.html is
 * fetched by sw.js) get dropped, which made /offline.html 404 in the
 * production container. Docker covers this with a full `COPY public`, but
 * plain `node .next/standalone/server.js` runs (and any future image
 * refactor) benefit from the essentials being present in the artifact.
 *
 * Idempotent: copies a whitelist of must-exist files into
 * .next/standalone/public if missing. Run after `next build` (postbuild).
 */
import { copyFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcPublic = path.join(root, "public");
const dstPublic = path.join(root, ".next/standalone/public");

// Everything the PWA shell + offline fallback needs (small, stable files).
const MUST_EXIST = [
  "offline.html",
  "sw.js",
  "manifest.webmanifest",
  "logo.png",
  "logo-cn.png",
  "logo-en.png",
  "favicon-16.png",
  "favicon-32.png",
  "icon-192.png",
  "icon-512.png",
  "apple-touch-icon.png",
];

mkdirSync(dstPublic, { recursive: true });

let copied = 0;
let missing = 0;
for (const name of MUST_EXIST) {
  const src = path.join(srcPublic, name);
  const dst = path.join(dstPublic, name);
  if (!statSync(src, { throwIfNoEntry: false })) {
    console.warn(`[copy-public-standalone] SKIP (not in repo public/): ${name}`);
    missing += 1;
    continue;
  }
  if (!statSync(dst, { throwIfNoEntry: false })) {
    copyFileSync(src, dst);
    copied += 1;
  }
}

console.log(
  `[copy-public-standalone] done: ${copied} copied, ${missing} missing from repo`,
);
