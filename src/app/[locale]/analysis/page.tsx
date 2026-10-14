import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AnalysisPageClient } from "@/components/analysis/analysis-page-client";
import { AnalysisSeoIntro } from "@/components/analysis/analysis-seo-intro";
import { ScopedMessages } from "@/components/providers/scoped-messages";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { webPageHowToJsonLd } from "@/lib/seo/web-page-json-ld";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const t = await getTranslations({ locale, namespace: "analysis" });
  return buildPageMetadata(locale, "/analysis", {
    title: tNav("analysis"),
    description: t("seoDescription"),
  });
}

/** Heatmap stays client-only; this page still SSRs crawlable copy + JSON-LD. */
export default async function AnalysisPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tNav = await getTranslations("nav");
  const t = await getTranslations("analysis");
  const tSeo = await getTranslations("seo");
  const steps = [t("seoHow1"), t("seoHow2"), t("seoHow3")];
  const jsonLd = webPageHowToJsonLd(locale, "/analysis", {
    name: `${tNav("analysis")} · ${tSeo("siteName")}`,
    description: t("seoDescription"),
    howToName: t("seoHowTitle"),
    steps,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ScopedMessages namespaces={["ai", "analysis", "symbol"]}>
        <div className="space-y-4 animate-[qtFade_0.45s_ease]">
          <AnalysisSeoIntro
            title={tNav("analysis")}
            intro={t("seoIntro")}
            howTitle={t("seoHowTitle")}
            steps={steps}
            disclaimer={t("seoDisclaimer")}
          />
          <AnalysisPageClient initialIndustries={[]} />
        </div>
      </ScopedMessages>
    </>
  );
}
