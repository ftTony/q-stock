import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "disclaimer" });
  return buildPageMetadata(locale, "/disclaimer", {
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function DisclaimerPage() {
  const t = await getTranslations("disclaimer");

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10 sm:px-6 animate-[qtFade_0.45s_ease]">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{t("subtitle")}</p>
      </div>

      <article className="space-y-4 text-sm leading-relaxed text-[var(--foreground)]">
        <p>{t("p1")}</p>
        <p>{t("p2")}</p>
        <p>{t("p3")}</p>
        <p>{t("p4")}</p>
        <p
          className="rounded-lg px-3 py-2.5 text-xs leading-relaxed sm:text-sm"
          style={{
            background: "color-mix(in srgb, #f59e0b 12%, transparent)",
            color: "color-mix(in srgb, #b45309 90%, var(--foreground))",
          }}
          role="note"
        >
          {t("mainlandNotice")}
        </p>
      </article>

      <Link
        href="/"
        className="inline-flex text-sm font-medium text-[var(--brand-text)] underline-offset-2 hover:underline"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
