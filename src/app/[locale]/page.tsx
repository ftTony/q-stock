import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import MarketsDashboard from "@/components/market/markets-dashboard";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return buildPageMetadata(locale, "/", {
    title: t("titleDefault"),
    description: t("description"),
    absoluteTitle: true,
  });
}

export default function MarketsPage() {
  return (
    <Suspense
      fallback={
        <div className="qt-panel p-8 text-sm text-[var(--muted)]">Loading…</div>
      }
    >
      <MarketsDashboard />
    </Suspense>
  );
}
