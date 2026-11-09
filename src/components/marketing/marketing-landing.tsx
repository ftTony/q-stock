import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { MarketingHero } from "@/components/marketing/marketing-hero";

const MarketingFeatureScreens = dynamic(
  () =>
    import("@/components/marketing/marketing-feature-screens").then((m) => ({
      default: m.MarketingFeatureScreens,
    })),
  { ssr: true },
);

const MarketingSectionDots = dynamic(
  () =>
    import("@/components/marketing/marketing-section-dots").then((m) => ({
      default: m.MarketingSectionDots,
    })),
  { ssr: true },
);

/**
 * 首页编排（服务端）：Hero / 能力区为独立客户端岛；
 * 双通道与信任/缘起由服务端 props 注入，不进 Hero 包。
 */
export function MarketingLanding({
  snapshotSlot,
  dualChannel,
  trustAndStory,
}: {
  snapshotSlot: ReactNode;
  dualChannel: ReactNode;
  trustAndStory: ReactNode;
}) {
  return (
    <div className="relative">
      <MarketingSectionDots />
      <MarketingHero snapshotSlot={snapshotSlot} />
      <MarketingFeatureScreens />
      {dualChannel}
      {trustAndStory}
    </div>
  );
}
