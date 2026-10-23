import type { AbstractIntlMessages } from "next-intl";

/**
 * 只发送到浏览器的翻译文案白名单。
 *
 * 背景：`[locale]/layout.tsx` 之前把 `getMessages()` 的**全量字典**（约 31 KB JSON）
 * 交给 `NextIntlClientProvider`。Next.js 会把它序列化进每一页的 HTML，
 * 并在每次客户端导航的 RSC payload 里重传一份。
 * 国内跨境链路实测吞吐只有 3–12 KB/s，这 31 KB 是首屏 HTML 一半以上的重量。
 *
 * 规则：只有被 `"use client"` 组件用到的命名空间才需要下发。
 * 服务端组件里用 `getTranslations()` 取的文案不会进 HTML，无需下发。
 *
 * `scripts/check-i18n-scope.mjs` 会校验这份白名单与各页声明是否覆盖全部用法，
 * 漏配会在脚本里直接报错，而不是等运行时 `MISSING_MESSAGE`。
 */

/** AppShell 及其客户端子树用到的命名空间（含设置弹窗）。 */
export const SHELL_NAMESPACES = [
  "app",
  "nav",
  "common",
  "market",
  "alerts",
  "settings",
  "paperRisk",
  "auth",
] as const;

/**
 * @deprecated 设置已整包进 SHELL_NAMESPACES；保留空数组以兼容 check-i18n-scope。
 */
export const SHELL_SETTINGS_KEYS = [] as const;

function pick(all: AbstractIntlMessages, keys: readonly string[]): AbstractIntlMessages {
  const out: AbstractIntlMessages = {};
  for (const key of keys) {
    const value = all[key];
    if (value !== undefined) out[key] = value;
  }
  return out;
}

/** 外壳需要的最小字典。`[locale]/layout.tsx` 用它替代全量 messages。 */
export function shellMessages(all: AbstractIntlMessages): AbstractIntlMessages {
  return pick(all, SHELL_NAMESPACES);
}

/**
 * 某一页需要下发的字典 = 外壳 + 该页声明的命名空间。
 *
 * 注意：`NextIntlClientProvider` 嵌套时 `messages` 是**整体替换**而非合并
 * （官方文档：individual props are treated as atomic），
 * 所以这里必须显式把外壳并进来，不能只传页面自己那一份。
 */
export function clientMessages(
  all: AbstractIntlMessages,
  namespaces: readonly string[],
): AbstractIntlMessages {
  if (namespaces.length === 0) return shellMessages(all);
  return { ...shellMessages(all), ...pick(all, namespaces) };
}
