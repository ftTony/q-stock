import type { Metadata } from "next";
import { getMessages, getTranslations } from "next-intl/server";
import { MarketingLanding } from "@/components/marketing/marketing-landing";
import { MarketingEvidenceScreen } from "@/components/marketing/marketing-evidence";
import { MarketingDualChannel } from "@/components/marketing/marketing-dual-channel";
import {
  MarketingTrustScreen,
  MarketingStoryScreen,
} from "@/components/marketing/marketing-trust-story";
import { ScopedMessages } from "@/components/providers/scoped-messages";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { marketingHomeJsonLd } from "@/lib/seo/marketing-json-ld";
import { getHomeSnapshot } from "@/lib/marketing/home-snapshot";
import type { SnapshotRowView } from "@/components/marketing/market-snapshot-card";

type Props = { params: Promise<{ locale: string }> };

export const revalidate = 60;

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

  /**
   * 首屏行情快照：服务端取一次（60s 缓存），失败就整卡降级成空态。
   * 首页不挂行情推送——那是 /markets 的事，也省流量。
   */
  const snapshot = await getHomeSnapshot();
  const messages = await getMessages();
  const marketNames = (messages.market ?? {}) as Record<string, string>;
  const rows: SnapshotRowView[] = snapshot.rows.map((row) => ({
    ...row,
    name:
      (row.nameKey ? marketNames[row.nameKey] : undefined) ??
      row.label ??
      row.id,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ScopedMessages namespaces={["marketing"]}>
        <MarketingLanding
          snapshot={{ rows, asOf: snapshot.asOf }}
          evidence={<MarketingEvidenceScreen />}
          dualChannel={<MarketingDualChannel />}
          trustAndStory={
            <>
              <MarketingTrustScreen />
              <MarketingStoryScreen />
            </>
          }
        />
      </ScopedMessages>
    </>
  );
}
