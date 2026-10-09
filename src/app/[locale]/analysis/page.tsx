import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AnalysisPageClient } from "@/components/analysis/analysis-page-client";
import { getQuotes } from "@/lib/market";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { POPULAR_STOCKS } from "@/lib/types";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const t = await getTranslations({ locale, namespace: "market" });
  return buildPageMetadata(locale, "/analysis", {
    title: tNav("analysis"),
    description: t("descStock"),
  });
}

export default async function AnalysisPage() {
  const tNav = await getTranslations("nav");
  let initialQuotes: Awaited<ReturnType<typeof getQuotes>> = [];
  try {
    initialQuotes = await getQuotes(
      POPULAR_STOCKS.map((symbol) => ({ symbol, assetType: "stock" as const })),
    );
  } catch {
    initialQuotes = [];
  }

  return (
    <div className="space-y-5 animate-[qtFade_0.45s_ease]">
      <section className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {tNav("analysis")}
        </h1>
      </section>
      <AnalysisPageClient initialTab="stock" initialQuotes={initialQuotes} />
    </div>
  );
}
