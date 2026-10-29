/**
 * 校验各语言包与源语言（zh-CN）的键位对等。
 *
 * 背景：`messages/en.json` 缺 47 个键、其余 8 种语言各缺 61 个，
 * 缺的都是 `symbol.*` 的估值字段标签。运行时虽然已由 `src/i18n/request.ts`
 * 逐级回退兜住，但缺口不盯就会继续扩大。
 *
 * 规则：
 *   1. 必须完整的语言：zh-CN、en（Sitemap 索引的两个语言）——缺键直接失败。
 *   2. 其余语言：只报覆盖率，不失败（配合运行时回退，属于「尽力覆盖」）。
 *   3. 任何语言出现源语言里没有的键（孤儿键）→ 失败，多为改名后没删干净。
 *   4. ICU 占位符必须与源语言一致（`{count}` 写成 `{n}` 会在运行时报错）。
 *
 * 用法：npm run check:i18n:keys
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname ?? ".", "..");
const MESSAGES = join(ROOT, "messages");
const BASE = "zh-CN";
const STRICT_LOCALES = ["zh-CN", "en"];

type Dict = Record<string, unknown>;

function flatten(obj: Dict, prefix = "", out = new Map<string, string>()): Map<string, string> {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flatten(value as Dict, path, out);
    } else {
      out.set(path, String(value));
    }
  }
  return out;
}

function placeholders(value: string): Set<string> {
  return new Set(Array.from(value.matchAll(/\{(\w+)/g), (m) => m[1]));
}

const files = readdirSync(MESSAGES).filter((f) => f.endsWith(".json"));
const bundles = new Map<string, Map<string, string>>();
for (const file of files) {
  const locale = file.replace(/\.json$/, "");
  const raw = JSON.parse(readFileSync(join(MESSAGES, file), "utf8")) as Dict;
  bundles.set(locale, flatten(raw));
}

const base = bundles.get(BASE);
if (!base) throw new Error(`缺少源语言包 ${BASE}.json`);

let failed = false;
const rows: string[] = [];

for (const [locale, keys] of [...bundles].sort((a, b) => a[0].localeCompare(b[0]))) {
  const missing = [...base.keys()].filter((k) => !keys.has(k));
  const orphan = [...keys.keys()].filter((k) => !base.has(k));

  const placeholderIssues: string[] = [];
  for (const [key, value] of keys) {
    const source = base.get(key);
    if (source === undefined) continue;
    const a = placeholders(source);
    const b = placeholders(value);
    const diff = [...a].filter((x) => !b.has(x)).concat([...b].filter((x) => !a.has(x)));
    if (diff.length) placeholderIssues.push(`${key} (${diff.join(", ")})`);
  }

  const coverage = (((base.size - missing.length) / base.size) * 100).toFixed(1);
  const strict = STRICT_LOCALES.includes(locale);
  const bad = (strict && missing.length > 0) || orphan.length > 0 || placeholderIssues.length > 0;
  if (bad) failed = true;

  const flag = bad ? "FAIL" : missing.length ? "warn" : " ok ";
  rows.push(
    `${flag}  ${locale.padEnd(7)} ${coverage.padStart(5)}%  ` +
      `缺失 ${String(missing.length).padStart(3)}  孤儿 ${String(orphan.length).padStart(2)}  ` +
      `占位符不符 ${String(placeholderIssues.length).padStart(2)}`,
  );

  if (missing.length && strict) {
    rows.push(`        缺失示例: ${missing.slice(0, 6).join(", ")}`);
  }
  if (orphan.length) {
    rows.push(`        孤儿键: ${orphan.slice(0, 6).join(", ")}`);
  }
  if (placeholderIssues.length) {
    rows.push(`        占位符: ${placeholderIssues.slice(0, 4).join(" | ")}`);
  }
}

console.log(`源语言 ${BASE}: ${base.size} 个键\n`);
console.log(rows.join("\n"));
console.log(
  `\n结论：${failed ? "存在必须修复的问题（见 FAIL 行）" : "无阻塞问题"}` +
    `\n（非 zh-CN/en 的缺失属于已知缺口，运行时已回退，不阻塞 CI）`,
);

if (failed) process.exit(1);
