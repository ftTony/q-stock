"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AiChartReadPanel } from "@/components/market/ai-chart-read-panel";
import { AiChatPanel } from "@/components/market/ai-chat-panel";
import { parseAssetType } from "@/lib/types";

export default function SymbolAiPage() {
  const params = useParams<{ assetType: string; symbol: string }>();
  const assetType = parseAssetType(params.assetType);
  const symbol = String(params.symbol || "").toUpperCase();
  const t = useTranslations("symbol");

  return (
    <div className="mx-auto max-w-3xl space-y-4 animate-[qtFade_0.45s_ease]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {t("aiDeskTitle", { symbol })}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{t("aiDeskSubtitle")}</p>
        </div>
        <Link
          href={`/symbol/${assetType}/${symbol}`}
          className="qt-btn-ghost inline-flex h-8 items-center rounded-md px-3 text-xs font-medium"
        >
          {t("backToSymbol")}
        </Link>
      </div>

      <div className="qt-panel space-y-1 p-4 sm:p-5">
        <AiChartReadPanel symbol={symbol} assetType={assetType} layout="page" />
        <AiChatPanel symbol={symbol} assetType={assetType} layout="page" />
      </div>
    </div>
  );
}
