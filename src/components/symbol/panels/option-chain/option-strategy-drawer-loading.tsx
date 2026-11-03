"use client";

import { useTranslations } from "next-intl";
import { PanelSkeleton } from "@/components/ui/panel-skeleton";

/** Placeholder while the strategy-tool body chunk loads. */
export function OptionStrategyDrawerLoading() {
  const t = useTranslations("common");
  return (
    <div className="px-4 py-4">
      <PanelSkeleton rows={8} label={t("loading")} />
    </div>
  );
}
