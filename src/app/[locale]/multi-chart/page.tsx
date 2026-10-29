import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MultiChartPage } from "@/components/multi-chart/multi-chart-page";
import { ScopedMessages } from "@/components/providers/scoped-messages";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "multiChart" });
  return buildPageMetadata(locale, "/multi-chart", {
    title: t("title"),
    description: t("seoDescription"),
  });
}

export default async function MultiChartRoute({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <ScopedMessages namespaces={["multiChart", "symbol", "market", "ai"]}>
      <MultiChartPage />
    </ScopedMessages>
  );
}
