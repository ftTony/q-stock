import type { SymbolTab } from "@/components/symbol/symbol-tabs-panel";
import type { AssetType } from "@/lib/types";

type TabItem = { id: SymbolTab; label: string };

/** Flip to true to bring the comments tab back. */
export const SYMBOL_COMMENTS_ENABLED = false;

/** 主 Tab：图表 | 衍生品 | …。资金/卖空/筹码在右栏「行情」。 */
export function buildSymbolTabs(
  t: (key: string) => string,
  assetType: AssetType,
  isIndex: boolean,
): TabItem[] {
  const chart: TabItem = { id: "chart", label: t("chartTab") };
  const rest: TabItem[] = [
    { id: "derivatives", label: t("derivatives") },
    { id: "news", label: t("news") },
    { id: "earnings", label: t("earnings") },
    { id: "profile", label: t("profile") },
    ...(SYMBOL_COMMENTS_ENABLED
      ? ([{ id: "comments", label: t("comments") }] as TabItem[])
      : []),
    { id: "press", label: t("press") },
  ];

  if (assetType === "crypto" || isIndex) {
    return [
      chart,
      ...rest.filter((x) => x.id === "news" || x.id === "comments"),
    ];
  }
  if (assetType === "cn") {
    // Comments were the only extra tab for CN; keep news + profile while comments are off.
    return [
      chart,
      ...rest.filter(
        (x) =>
          x.id === "comments" ||
          x.id === "news" ||
          x.id === "profile",
      ),
    ];
  }
  if (assetType === "hk") {
    return [
      chart,
      ...rest.filter((x) => x.id !== "press"),
    ];
  }
  return [chart, ...rest];
}

export function fallbackSymbolTab(
  tabs: TabItem[],
  current: SymbolTab,
): SymbolTab {
  const allowed = new Set(tabs.map((x) => x.id));
  if (allowed.has(current) && current !== "ai") return current;
  if (allowed.has("chart")) return "chart";
  if (SYMBOL_COMMENTS_ENABLED && allowed.has("comments")) return "comments";
  return "news";
}
