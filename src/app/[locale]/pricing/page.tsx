import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  MarketingPricing,
  type OnlinePlanCopy,
  type PricingPlanCopy,
} from "@/components/marketing/marketing-pricing";
import { ScopedMessages } from "@/components/providers/scoped-messages";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });
  return buildPageMetadata(locale, "/pricing", {
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function PricingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pricing");

  const onlinePlans: [OnlinePlanCopy, OnlinePlanCopy] = [
    {
      name: t("online.free.name"),
      price: t("online.free.price"),
      priceNote: t("online.free.priceNote"),
      description: t("online.free.description"),
      features: [
        t("online.free.f1"),
        t("online.free.f2"),
        t("online.free.f3"),
        t("online.free.f4"),
        t("online.free.f5"),
      ],
      cta: t("online.free.cta"),
      href: "/register",
    },
    {
      name: t("online.pro.name"),
      price: t("online.pro.price"),
      priceNote: t("online.pro.priceNote"),
      description: t("online.pro.description"),
      features: [
        t("online.pro.f1"),
        t("online.pro.f2"),
        t("online.pro.f3"),
        t("online.pro.f4"),
        t("online.pro.f5"),
      ],
      cta: t("online.pro.cta"),
      highlighted: true,
      href: "/settings",
      trackUpgrade: true,
    },
  ];

  const plans: [PricingPlanCopy, PricingPlanCopy, PricingPlanCopy] = [
    {
      name: t("plans.source.name"),
      originalPrice: t("plans.source.originalPrice"),
      price: t("plans.source.price"),
      priceNote: t("plans.source.priceNote"),
      description: t("plans.source.description"),
      features: [
        t("plans.source.f1"),
        t("plans.source.f2"),
        t("plans.source.f3"),
        t("plans.source.f4"),
      ],
      cta: t("plans.source.cta"),
    },
    {
      name: t("plans.deploy.name"),
      originalPrice: t("plans.deploy.originalPrice"),
      price: t("plans.deploy.price"),
      priceNote: t("plans.deploy.priceNote"),
      description: t("plans.deploy.description"),
      features: [
        t("plans.deploy.f1"),
        t("plans.deploy.f2"),
        t("plans.deploy.f3"),
        t("plans.deploy.f4"),
      ],
      cta: t("plans.deploy.cta"),
      highlighted: true,
    },
    {
      name: t("plans.custom.name"),
      price: t("plans.custom.price"),
      priceNote: t("plans.custom.priceNote"),
      description: t("plans.custom.description"),
      features: [
        t("plans.custom.f1"),
        t("plans.custom.f2"),
        t("plans.custom.f3"),
        t("plans.custom.f4"),
        t("plans.custom.f5"),
      ],
      cta: t("plans.custom.cta"),
    },
  ];

  return (
    <ScopedMessages namespaces={["marketing", "pricing"]}>
      <MarketingPricing
        title={t("title")}
        subtitle={t("subtitle")}
        onlineTitle={t("onlineTitle")}
        onlineSubtitle={t("onlineSubtitle")}
        onlinePlans={onlinePlans}
        sourceTitle={t("sourceTitle")}
        sourceSubtitle={t("sourceSubtitle")}
        plans={plans}
        footnote={t("footnote")}
      />
    </ScopedMessages>
  );
}
