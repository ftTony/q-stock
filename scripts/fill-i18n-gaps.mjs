/**
 * Fill missing locale keys from en (then zh-CN) so UI locales don't fall back mid-sentence.
 * Does not overwrite existing keys. Run: node scripts/fill-i18n-gaps.mjs
 */
import fs from "node:fs";
import path from "node:path";

const MESSAGES = path.join(process.cwd(), "messages");
const locales = fs
  .readdirSync(MESSAGES)
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(/\.json$/, ""));

function deepMergeMissing(target, source) {
  let added = 0;
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return { result: target, added };
  }
  const out = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (!(key in out) || out[key] === undefined) {
      out[key] = value;
      added += 1;
    } else if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      out[key] &&
      typeof out[key] === "object" &&
      !Array.isArray(out[key])
    ) {
      const nested = deepMergeMissing(out[key], value);
      out[key] = nested.result;
      added += nested.added;
    }
  }
  return { result: out, added };
}

const zh = JSON.parse(fs.readFileSync(path.join(MESSAGES, "zh-CN.json"), "utf8"));
const en = JSON.parse(fs.readFileSync(path.join(MESSAGES, "en.json"), "utf8"));

for (const locale of locales) {
  if (locale === "zh-CN" || locale === "en") continue;
  const file = path.join(MESSAGES, `${locale}.json`);
  const current = JSON.parse(fs.readFileSync(file, "utf8"));
  const fromEn = deepMergeMissing(current, en);
  const fromZh = deepMergeMissing(fromEn.result, zh);
  fs.writeFileSync(file, `${JSON.stringify(fromZh.result, null, 2)}\n`);
  console.log(
    `${locale}: +${fromEn.added} from en, +${fromZh.added - fromEn.added} from zh-CN`,
  );
}
