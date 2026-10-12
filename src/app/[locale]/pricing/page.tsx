import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  MarketingPricing,
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
  // 必须显式声明 locale，否则 `getTranslations()` 会回落到读请求头，
  // 整个路由被判为动态渲染（响应头变成 no-store，CDN 无法缓存）。
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pricing");

  const plans: [PricingPlanCopy, PricingPlanCopy, PricingPlanCopy] = [
    {
      name: t("plans.source.name"),
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
    <ScopedMessages namespaces={["marketing"]}>
      <MarketingPricing
        title={t("title")}
        subtitle={t("subtitle")}
        plans={plans}
        footnote={t("footnote")}
      />
    </ScopedMessages>
  );
}
