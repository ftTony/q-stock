import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { clientMessages } from "@/i18n/client-messages";

/**
 * 把「外壳 + 本页」所需的最小翻译字典交给客户端组件。
 *
 * 必须由**服务端组件**渲染，通常放在路由的 `layout.tsx`（页面本身是 `"use client"` 时）
 * 或 `page.tsx`（页面是服务端组件时）。
 *
 * `namespaces` 只填本页客户端组件额外用到的命名空间，外壳部分会自动带上；
 * 漏填会导致运行时 MISSING_MESSAGE，`npm run check:i18n` 会提前发现。
 *
 * Prefer passing `locale` from `params` so the nested provider never relies on
 * request-config inference during Turbopack / soft-nav recovery.
 */
export async function ScopedMessages({
  namespaces = [],
  locale: localeProp,
  children,
}: {
  namespaces?: readonly string[];
  locale?: string;
  children: React.ReactNode;
}) {
  const [all, requestLocale] = await Promise.all([
    getMessages(),
    localeProp ? Promise.resolve(localeProp) : getLocale(),
  ]);
  const locale = localeProp ?? requestLocale;
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={clientMessages(all, namespaces)}
    >
      {children}
    </NextIntlClientProvider>
  );
}
