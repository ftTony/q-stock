import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarketingLanding } from "@/components/marketing/marketing-landing";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { marketingHomeJsonLd } from "@/lib/seo/marketing-json-ld";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const tM = await getTranslations({ locale, namespace: "marketing" });
  return buildPageMetadata(locale, "/", {
    title: t("titleDefault"),
    description: tM("seoDescription"),
    absoluteTitle: true,
  });
}

export default async function MarketingHomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const tM = await getTranslations({ locale, namespace: "marketing" });
  const jsonLd = marketingHomeJsonLd(locale, {
    siteName: t("siteName"),
    description: tM("seoDescription"),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketingLanding />
    </>
  );
}
