/**
 * Production-oriented `next build`:
 * - prisma generate
 * - SSG only primary locales (others on-demand)
 * - skip duplicate typecheck when CI already ran `tsc`
 *
 * Usage: `npm run build:prod`
 * Override: SSG_LOCALES=en,zh-CN SKIP_TYPECHECK=0 npm run build:prod
 */
import { spawnSync } from "node:child_process";

process.env.NEXT_TELEMETRY_DISABLED ??= "1";
process.env.SSG_LOCALES ??= "en,zh-CN,zh-TW";
process.env.SKIP_TYPECHECK ??= "1";

function run(cmd: string, args: string[]) {
  const r = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.info(
  `[build:prod] SSG_LOCALES=${process.env.SSG_LOCALES} SKIP_TYPECHECK=${process.env.SKIP_TYPECHECK}`,
);
run("npx", ["prisma", "generate"]);
run("npx", ["next", "build"]);
