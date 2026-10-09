import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AnalysisPageClient } from "@/components/analysis/analysis-page-client";
import type { IndustryHeatCell } from "@/components/analysis/types";
import { auth } from "@/lib/auth";
import { getIndustryHeatmap } from "@/lib/market/industry";
import { withUserMarket } from "@/lib/market/with-user-market";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

type Props = { params: Promise<{ locale: string }> };

async function loadInitialIndustries(): Promise<IndustryHeatCell[]> {
  const session = await auth();
  return withUserMarket(session?.user?.id, async () => {
    try {
      const result = await getIndustryHeatmap("stock", 40);
      return [...result.industries].sort((a, b) => b.weight - a.weight);
    } catch {
      return [];
    }
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const t = await getTranslations({ locale, namespace: "analysis" });
  return buildPageMetadata(locale, "/analysis", {
    title: tNav("analysis"),
    description: t("subtitle"),
  });
}

export default async function AnalysisPage() {
  const initialIndustries = await loadInitialIndustries();
  return (
    <div className="animate-[qtFade_0.45s_ease]">
      <AnalysisPageClient initialIndustries={initialIndustries} />
    </div>
  );
}
