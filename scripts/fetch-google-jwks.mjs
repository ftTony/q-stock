#!/usr/bin/env node
/**
 * Refresh the bundled Google OAuth JWKS snapshot used by One Tap verification.
 *
 *   node scripts/fetch-google-jwks.mjs            # direct connection
 *   HTTPS_PROXY=http://127.0.0.1:7897 node scripts/fetch-google-jwks.mjs
 *   npm run auth:refresh-jwks -- --proxy http://127.0.0.1:7897
 *
 * Only needed if Google rotates its signing keys AND the host cannot fetch
 * them live (the runtime code always tries a live refresh first).
 */
import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { execFileSync } from "node:child_process";

const JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const OUT = path.join(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "..",
  "src",
  "lib",
  "auth",
  "google-jwks.ts",
);

const proxyIdx = process.argv.indexOf("--proxy");
const proxy =
  (proxyIdx > 0 ? process.argv[proxyIdx + 1] : undefined) ||
  process.env.HTTPS_PROXY ||
  process.env.https_proxy ||
  "";

// curl honours HTTPS_PROXY itself; passing -x explicitly keeps behaviour clear.
const curlArgs = ["-sS", "-m", "15", "-o", "-", JWKS_URL];
if (proxy) curlArgs.unshift("-x", proxy);

let raw;
try {
  raw = JSON.parse(execFileSync("curl", curlArgs, { encoding: "utf8" }));
} catch (err) {
  console.error(
    `fetch failed (${err.message}). Set HTTPS_PROXY or pass --proxy http://127.0.0.1:PORT`,
  );
  process.exit(1);
}

if (!Array.isArray(raw?.keys) || raw.keys.length === 0) {
  console.error("no keys in JWKS response");
  process.exit(1);
}

const header = `// Snapshot of Google's OAuth JWKS (${JWKS_URL})
// Refresh with: node scripts/fetch-google-jwks.mjs
// Runtime always tries a live refresh first; this file is the offline fallback.
export const GOOGLE_JWKS_BUNDLED = ${JSON.stringify(raw, null, 2)} as const;
`;
fs.writeFileSync(OUT, header, "utf8");
console.log(
  `wrote ${OUT} with ${raw.keys.length} keys:`,
  raw.keys.map((k) => k.kid).join(", "),
);
