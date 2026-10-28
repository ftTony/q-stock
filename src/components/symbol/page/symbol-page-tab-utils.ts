import type { CandleResolution } from "@/lib/types";
import type { SymbolTab } from "@/components/symbol/tabs/symbol-tabs-types";

export function panelTabFor(isDesktop: boolean, tab: SymbolTab): SymbolTab {
  if (!isDesktop) {
    return tab === "press" || tab === "comments" ? "news" : tab;
  }
  return tab === "news" || tab === "press" || tab === "comments" ? "chart" : tab;
}

export function candleResolutionLabels(
  t: (key: string) => string,
): Record<CandleResolution, string> {
  return {
    T: t("intraday"),
    "1": t("min1"),
    "5": t("min5"),
    D: t("day"),
    Q: t("quarter"),
    Y: t("year"),
  };
}
