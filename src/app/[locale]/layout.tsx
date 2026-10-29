import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type AppLocale } from "@/i18n/config";
import { ssgLocales } from "@/i18n/ssg-locales";
import { shellMessages } from "@/i18n/client-messages";
import { AppProviders } from "@/components/providers/app-providers";
import { AppShell } from "@/components/layout/app-shell";
import { GoogleAnalytics } from "@/components/seo/google-analytics";
import { gaMeasurementId, googleSiteVerification } from "@/lib/seo/analytics";
import { siteOrigin } from "@/lib/seo/site-url";
import { buildLocaleMetadata } from "@/lib/seo/locale-metadata";
import "../globals.css";

/**
 * 真正的根文档布局：`<html>` / `<body>`、全局 CSS、字体、GA、主题脚本都在这里。
 * 上层 `src/app/layout.tsx` 仅为 pass-through（满足 Next 对 `_not-found` 的要求）。
 *
 * 注意：`lang` 取自 `params.locale`（构建期可推导），**不要**改成 `getLocale()`，
 * 那会读请求头并把 ISR 打回动态渲染。
 *
 * Fonts: avoid `next/font/google` — Google Fonts fetch fails on many CN hosts
 * and crashes Turbopack/Jest workers with "child process exceptions".
 */

const siteVerification = googleSiteVerification();

export function generateStaticParams() {
  return ssgLocales().map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f5f9" },
    { media: "(prefers-color-scheme: dark)", color: "#06090f" },
  ],
  colorScheme: "light dark",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const localeMeta = await buildLocaleMetadata(locale);

  // `appleWebApp` 的类型是 `boolean | AppleWebApp`，直接展开会报类型错。
  const appleOverride =
    typeof localeMeta.appleWebApp === "object" && localeMeta.appleWebApp !== null
      ? localeMeta.appleWebApp
      : undefined;

  return {
    metadataBase: new URL(siteOrigin()),
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    ...(siteVerification
      ? { verification: { google: siteVerification } }
      : {}),
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "48x48" },
        { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
    ...localeMeta,
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      startupImage: [
        {
          url: "/logo.png",
          media:
            "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
        },
        {
          url: "/logo.png",
          media:
            "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)",
        },
        { url: "/logo.png" },
      ],
      ...(appleOverride ?? {}),
    },
    other: {
      "mobile-web-app-capable": "yes",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as AppLocale)) notFound();
  setRequestLocale(locale);

  // 只把「外壳」需要的文案发给浏览器。各页额外的命名空间由该页的
  // <ScopedMessages namespaces={[...]}> 就近补齐 —— 全量字典（约 30 KB）
  // 会被序列化进每一页 HTML，并随每次客户端导航重传。
  const messages = shellMessages(await getMessages());
  const gaId = gaMeasurementId();

  return (
    <html lang={locale} data-change="cn" suppressHydrationWarning>
      <head>
        {/* Apply stored theme before paint so light default is not overwritten by a dark flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark")document.documentElement.classList.add("dark");else document.documentElement.classList.remove("dark");}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <AppProviders>
            <AppShell>{children}</AppShell>
          </AppProviders>
        </NextIntlClientProvider>
        {gaId ? (
          <Suspense fallback={null}>
            <GoogleAnalytics measurementId={gaId} />
          </Suspense>
        ) : null}
      </body>
    </html>
  );
}
