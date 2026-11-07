import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LabLanding } from "@/components/marketing/lab-landing";
import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";
import { ScopedMessages } from "@/components/providers/scoped-messages";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lab" });
  return buildPageMetadata(locale, "/lab", {
    title: t("seo.title"),
    description: t("seo.description"),
  });
}

export default async function LabPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <ScopedMessages namespaces={["marketing"]}>
      <div className="flex min-h-0 flex-1 flex-col">
        <LabLanding />
        <MarketingCtaBand compact />
      </div>
    </ScopedMessages>
  );
}
