import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type AppLocale } from "@/i18n/config";
import { AppProviders } from "@/components/providers/app-providers";
import { AppShell } from "@/components/layout/app-shell";
import { auth } from "@/lib/auth";
import { buildLocaleMetadata } from "@/lib/seo/locale-metadata";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildLocaleMetadata(locale);
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

  const messages = await getMessages();
  const session = await auth();
  const scheme =
    (session?.user?.changeColorScheme as "cn" | "us" | undefined) ?? null;

  return (
    <NextIntlClientProvider messages={messages}>
      <AppProviders changeColorScheme={scheme}>
        <AppShell>{children}</AppShell>
      </AppProviders>
    </NextIntlClientProvider>
  );
}
