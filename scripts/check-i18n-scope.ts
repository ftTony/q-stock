/**
 * 校验 i18n 客户端文案白名单是否覆盖所有真实用法。
 *
 * 背景：`src/i18n/client-messages.ts` 把发给浏览器的翻译字典从「全量」收窄成
 * 「外壳 + 本页所需」。如果某个 `"use client"` 组件用了没下发的命名空间，
 * next-intl 会在运行时抛 MISSING_MESSAGE（页面直接报错）。
 * 这个脚本用静态导入图提前把这类漏配找出来。
 *
 * 用法：npm run check:i18n
 * 退出码非 0 表示存在漏配，会在 CI / 提交前拦住。
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve as resolvePath } from "node:path";

const ROOT = resolvePath(import.meta.dirname ?? ".", "..");
const SRC = join(ROOT, "src");
const APP = join(SRC, "app", "[locale]");

const read = (p: string) => readFileSync(p, "utf8");

function tryResolve(spec: string, fromFile: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = join(SRC, spec.slice(2));
  else if (spec.startsWith(".")) base = resolvePath(dirname(fromFile), spec);
  else return null;
  for (const cand of [
    `${base}.tsx`,
    `${base}.ts`,
    join(base, "index.tsx"),
    join(base, "index.ts"),
  ]) {
    if (existsSync(cand) && statSync(cand).isFile()) return cand;
  }
  return null;
}

const IMPORT_RE = /(?:import|export)[^;\n]*?from\s*["']([^"']+)["']/g;

function closure(entry: string, seen = new Set<string>()): Set<string> {
  if (seen.has(entry) || !existsSync(entry)) return seen;
  seen.add(entry);
  const src = read(entry);
  for (const m of src.matchAll(IMPORT_RE)) {
    const next = tryResolve(m[1], entry);
    if (next) closure(next, seen);
  }
  return seen;
}

const isClient = (src: string) => /^\s*["']use client["']/m.test(src);
const NS_RE = /useTranslations\(\s*["']([^"']+)["']/g;

function clientNamespaces(files: Iterable<string>): Set<string> {
  const out = new Set<string>();
  for (const f of files) {
    const src = read(f);
    if (!isClient(src)) continue;
    for (const m of src.matchAll(NS_RE)) out.add(m[1]);
  }
  return out;
}

function declaredNamespaces(files: Iterable<string>): Set<string> {
  const out = new Set<string>();
  for (const f of files) {
    const src = read(f);
    const block = /<ScopedMessages[\s\S]*?namespaces=\{(\[[^\]]*\])\}/.exec(src);
    if (!block) continue;
    for (const m of block[1].matchAll(/["']([^"']+)["']/g)) out.add(m[1]);
  }
  return out;
}

function listRoutes(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory()) continue;
    if (existsSync(join(p, "page.tsx"))) acc.push(p);
    listRoutes(p, acc);
  }
  return acc;
}

/** 收集某路由自身及其祖先（不含 [locale] 外壳）的 layout.tsx */
function layoutsFor(routeDir: string): string[] {
  const out: string[] = [];
  let cur = routeDir;
  while (cur !== APP && cur.startsWith(APP)) {
    const lay = join(cur, "layout.tsx");
    if (existsSync(lay)) out.push(lay);
    cur = dirname(cur);
  }
  return out;
}

const configSrc = read(join(SRC, "i18n", "client-messages.ts"));
const grabArray = (name: string): string[] => {
  const m = new RegExp(`${name}\\s*=\\s*\\[([^\\]]*)\\]`).exec(configSrc);
  return m ? [...m[1].matchAll(/["']([^"']+)["']/g)].map((x) => x[1]) : [];
};
const SHELL = new Set(grabArray("SHELL_NAMESPACES"));
const SHELL_SETTINGS_KEYS = new Set(grabArray("SHELL_SETTINGS_KEYS"));

const problems: string[] = [];
const notes: string[] = [];

// 1) 若未把 settings 整包进 SHELL_NAMESPACES，则外壳用到的 settings 键须列入 SHELL_SETTINGS_KEYS
if (!SHELL.has("settings")) {
  const shellFiles = closure(join(SRC, "components", "layout", "app-shell.tsx"));
  for (const f of shellFiles) {
    const src = read(f);
    if (!isClient(src) || !/useTranslations\(\s*["']settings["']\s*\)/.test(src)) continue;
    const used = new Set<string>();
    for (const m of src.matchAll(/\bt\(\s*["']([^"']+)["']/g)) {
      used.add(m[1].split(".")[0]);
    }
    for (const key of used) {
      if (!SHELL_SETTINGS_KEYS.has(key)) {
        problems.push(
          `${relative(ROOT, f)} 用到 settings.${key}，但未列入 SHELL_SETTINGS_KEYS（src/i18n/client-messages.ts）`,
        );
      }
    }
  }
}

// 2) 每个路由声明的命名空间，必须覆盖该路由客户端组件真正用到的
for (const routeDir of listRoutes(APP)) {
  const rel = relative(APP, routeDir).replace(/\\/g, "/");
  const route = rel ? `/${rel}` : "/";
  const ownLayouts = layoutsFor(routeDir);
  const tree = new Set([...closure(join(routeDir, "page.tsx"))]);
  for (const l of ownLayouts) for (const f of closure(l)) tree.add(f);

  const required = [...clientNamespaces(tree)].filter((n) => !SHELL.has(n));
  const declared = declaredNamespaces([join(routeDir, "page.tsx"), ...ownLayouts]);

  const missing = required.filter((n) => !declared.has(n));
  const extra = [...declared].filter((n) => !required.includes(n));
  if (missing.length) {
    problems.push(`${route} 缺少 namespaces: ${missing.join(", ")}`);
  }
  if (extra.length) {
    notes.push(`${route} 多声明（可减小体积）: ${extra.join(", ")}`);
  }
}

for (const n of notes) console.log(`提示  ${n}`);
if (problems.length) {
  console.error(`\n发现 ${problems.length} 处 i18n 作用域问题：`);
  for (const p of problems) console.error(`  错误  ${p}`);
  console.error("\n修法：在对应 page.tsx / layout.tsx 的 <ScopedMessages namespaces={[...]}> 里补上缺失命名空间，");
  console.error("或（若为外壳用键）在 src/i18n/client-messages.ts 的 SHELL_SETTINGS_KEYS 中补上。");
  process.exit(1);
}
console.log(`\n通过：外壳 ${[...SHELL].join(", ")} + settings(${[...SHELL_SETTINGS_KEYS].join(", ")})；所有路由的 ScopedMessages 声明均覆盖实际用法。`);
