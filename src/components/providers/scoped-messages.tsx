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
 */
export async function ScopedMessages({
  namespaces = [],
  children,
}: {
  namespaces?: readonly string[];
  children: React.ReactNode;
}) {
  const [all, locale] = await Promise.all([getMessages(), getLocale()]);
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={clientMessages(all, namespaces)}
    >
      {children}
    </NextIntlClientProvider>
  );
}
