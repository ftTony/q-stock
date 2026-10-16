import type { SymbolTab } from "@/components/symbol/symbol-tabs-panel";
import type { AssetType } from "@/lib/types";

type TabItem = { id: SymbolTab; label: string };

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
    { id: "comments", label: t("comments") },
    { id: "press", label: t("press") },
    { id: "officers", label: t("officers") },
    { id: "sentiment", label: t("sentiment") },
  ];

  if (assetType === "crypto" || isIndex) {
    return [
      chart,
      ...rest.filter(
        (x) =>
          x.id === "news" ||
          x.id === "comments" ||
          x.id === "sentiment",
      ),
    ];
  }
  if (assetType === "cn") {
    return [chart, ...rest.filter((x) => x.id === "comments")];
  }
  if (assetType === "hk") {
    return [
      chart,
      ...rest.filter(
        (x) =>
          x.id !== "sentiment" && x.id !== "press" && x.id !== "officers",
      ),
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
  if (allowed.has("comments")) return "comments";
  return "news";
}
