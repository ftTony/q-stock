import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CompoundCalculator } from "@/components/tools/compound-calculator";
import { DcaCalculator } from "@/components/tools/dca-calculator";
import { OptionsCalculator } from "@/components/tools/options-calculator";
import { PositionCalculator } from "@/components/tools/position-calculator";
import { ToolPageShell } from "@/components/tools/tool-page-shell";
import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";
import { ScopedMessages } from "@/components/providers/scoped-messages";
import {
  TOOL_CATALOG,
  getToolMeta,
  type ToolSlug,
} from "@/lib/tools/catalog";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return TOOL_CATALOG.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const meta = getToolMeta(slug);
  if (!meta) {
    return buildPageMetadata(locale, `/tools/${slug}`, {
      title: "Tools",
      robots: { index: false, follow: false },
    });
  }
  const t = await getTranslations({ locale, namespace: "tools" });
  return buildPageMetadata(locale, meta.href, {
    title: t(`${meta.slug}.title`),
    description: t(`${meta.slug}.subtitle`),
  });
}

function Calculator({ slug }: { slug: ToolSlug }) {
  if (slug === "position") return <PositionCalculator />;
  if (slug === "dca") return <DcaCalculator />;
  if (slug === "compound") return <CompoundCalculator />;
  return <OptionsCalculator />;
}

export default async function ToolDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const meta = getToolMeta(slug);
  if (!meta) notFound();

  const t = await getTranslations("tools");

  return (
    <ScopedMessages namespaces={["marketing", "tools"]}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
          <ToolPageShell
            indexTitle={t("title")}
            title={t(`${meta.slug}.title`)}
            subtitle={t(`${meta.slug}.subtitle`)}
            disclaimer={t("disclaimer")}
            disclaimerLinkLabel={t("disclaimerLink")}
            ctaMarkets={t("ctaMarkets")}
            ctaPortfolio={t("ctaPortfolio")}
          >
            <Calculator slug={meta.slug} />
          </ToolPageShell>
        </div>
        <MarketingCtaBand />
      </div>
    </ScopedMessages>
  );
}
