"use client";

import { useTranslations } from "next-intl";

export function TradeAiLinks({
  onOpenCalm,
  onOpenAi,
}: {
  onOpenCalm?: () => void;
  onOpenAi?: () => void;
}) {
  const t = useTranslations("trading");
  if (!onOpenCalm && !onOpenAi) return null;

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {onOpenCalm ? (
        <button type="button" onClick={onOpenCalm} className="aw-text-link text-[12px]">
          {t("useCalmDraft")}
        </button>
      ) : null}
      {onOpenAi ? (
        <button type="button" onClick={onOpenAi} className="aw-text-link text-[12px]">
          {t("askSymbol")}
        </button>
      ) : null}
    </div>
  );
}
