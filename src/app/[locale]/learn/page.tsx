import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "learn" });
  return buildPageMetadata(locale, "/learn", {
    title: t("title"),
    description: t("comingSoonBody"),
  });
}

export default async function LearnIndexPage() {
  const t = await getTranslations("learn");

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-3xl flex-col justify-center px-4 py-16 sm:px-6 animate-[qtFade_0.45s_ease]">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("title")}
        </h1>
        <p className="text-lg font-medium tracking-tight text-[var(--brand-text)] sm:text-xl">
          {t("comingSoon")}
        </p>
        <p className="max-w-lg text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          {t("comingSoonBody")}
        </p>
      </header>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Link
          href="/markets"
          className="qt-btn qt-btn-primary h-10 px-4 text-sm"
        >
          {t("ctaMarkets")}
        </Link>
        <Link
          href="/"
          className="qt-btn qt-btn-ghost h-10 px-4 text-sm"
        >
          {t("backHome")}
        </Link>
      </div>

      <p className="mt-12 text-xs leading-relaxed text-[var(--muted)]">
        {t("disclaimer")}{" "}
        <Link
          href="/disclaimer"
          className="underline-offset-2 hover:text-[var(--foreground)] hover:underline"
        >
          {t("disclaimerLink")}
        </Link>
      </p>
    </div>
  );
}
