import { getMessages } from "next-intl/server";
import { MarketSnapshotCard } from "@/components/marketing/market-snapshot-card";
import type { SnapshotRowView } from "@/components/marketing/market-snapshot-card";
import { getHomeSnapshot } from "@/lib/marketing/home-snapshot";

/** 异步快照岛：供首页 Suspense 流式输出，不堵 Hero 文案 TTFB。 */
export async function HomeSnapshotSlot() {
  const [snapshot, messages] = await Promise.all([
    getHomeSnapshot(),
    getMessages(),
  ]);
  const marketNames = (messages.market ?? {}) as Record<string, string>;
  const rows: SnapshotRowView[] = snapshot.rows.map((row) => ({
    ...row,
    name:
      (row.nameKey ? marketNames[row.nameKey] : undefined) ??
      row.label ??
      row.id,
  }));

  return <MarketSnapshotCard rows={rows} asOf={snapshot.asOf} />;
}
