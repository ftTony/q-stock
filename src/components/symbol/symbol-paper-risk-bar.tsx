"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  usePaperRiskSettings,
  useTradingAccount,
  useTradingPositions,
} from "@/hooks/query/use-trading";
import { queryKeys } from "@/lib/query/keys";
import { formatNumber } from "@/lib/format-number";
import { DEFAULT_RISK_SETTINGS } from "@/lib/trading/risk-math";
import type { AssetType } from "@/lib/types";

type Pos = {
  symbol: string;
  assetType: string;
  qty: number;
  avgCost: number;
  price: number | null;
  marketValue: number | null;
};

function money(n: number) {
  return formatNumber(n, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function Cell({
  label,
  value,
  tone,
  primary,
  hint,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn";
  primary?: boolean;
  hint?: string;
}) {
  const color =
    tone === "ok"
      ? "text-[var(--up)]"
      : tone === "warn"
        ? "text-[color-mix(in_srgb,#ca8a04_90%,var(--foreground))]"
        : "";
  return (
    <div className="min-w-0 text-left">
      <div className="aw-metric-label">{label}</div>
      <div
        className={`mt-1 truncate ${
          primary
            ? "aw-metric-value"
            : "text-[13px] font-medium tabular-nums tracking-[-0.16px] text-[var(--foreground)]"
        } ${color}`}
      >
        {value}
      </div>
      {hint ? (
        <div className="aw-caption mt-0.5 truncate">{hint}</div>
      ) : null}
    </div>
  );
}

export function SymbolPaperRiskBar({
  symbol,
  assetType,
  lastPrice,
  refreshKey = 0,
}: {
  symbol: string;
  assetType: AssetType;
  lastPrice: number | null;
  refreshKey?: number;
}) {
  const t = useTranslations("paperRiskBar");
  const { data: session, status } = useSession();
  const qc = useQueryClient();
  const signedIn = Boolean(session?.user);

  const accountQuery = useTradingAccount(signedIn);
  const positionsQuery = useTradingPositions({
    quotes: true,
    enabled: signedIn,
  });
  const riskQuery = usePaperRiskSettings(signedIn);

  useEffect(() => {
    if (!refreshKey) return;
    void qc.invalidateQueries({ queryKey: queryKeys.trading.all });
  }, [refreshKey, qc]);

  if (status === "loading") return null;
  if (!session?.user) return null;

  const cash =
    (accountQuery.data as { account?: { cashBalance?: number } } | undefined)
      ?.account?.cashBalance ?? null;
  if (cash == null) return null;

  const positions =
    ((positionsQuery.data as { positions?: Pos[] } | undefined)?.positions ??
      []) as Pos[];
  const maxPct =
    (
      riskQuery.data as
        | { settings?: { maxPositionPctPerSymbol?: number } }
        | undefined
    )?.settings?.maxPositionPctPerSymbol ??
    DEFAULT_RISK_SETTINGS.maxPositionPctPerSymbol;

  const mark = lastPrice && lastPrice > 0 ? lastPrice : 0;
  let gross = 0;
  let symbolNotional = 0;
  for (const pos of positions) {
    const isSym = pos.symbol === symbol && pos.assetType === assetType;
    let mv = pos.marketValue;
    if (mv == null || !Number.isFinite(mv)) {
      const px = isSym && mark > 0 ? mark : pos.price ?? pos.avgCost;
      mv = pos.qty * px;
    } else if (isSym && mark > 0) {
      mv = pos.qty * mark;
    }
    gross += mv;
    if (isSym) symbolNotional = mv;
  }

  const equity = cash + gross;
  const symbolPct = equity > 0 ? (symbolNotional / equity) * 100 : 0;
  const exposurePct = equity > 0 ? (gross / equity) * 100 : 0;
  const nearCap = symbolPct >= maxPct * 0.8;

  return (
    <div className="border-b border-[var(--aw-hairline,var(--border))] px-4 py-2.5">
      <div className="grid grid-cols-2 gap-x-5 gap-y-2">
        <Cell label={t("equity")} value={`$${money(equity)}`} primary />
        <Cell label={t("cash")} value={`$${money(cash)}`} primary />
        <Cell
          label={t("exposure")}
          value={`$${money(gross)} (${exposurePct.toFixed(2)}%)`}
        />
        <Cell
          label={t("symbolPct")}
          value={`${symbolPct.toFixed(2)}%`}
          tone={nearCap ? "warn" : "ok"}
          hint={`${t("maxSymbol")} ${maxPct.toFixed(2)}%`}
        />
      </div>
    </div>
  );
}
