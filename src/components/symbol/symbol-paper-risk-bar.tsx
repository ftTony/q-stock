"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
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
        className={`mt-0.5 truncate ${
          primary ? "aw-metric-value" : "aw-caption tabular-nums"
        } ${color}`}
      >
        {value}
      </div>
      {hint ? <div className="aw-metric-label truncate">{hint}</div> : null}
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
  const [cash, setCash] = useState<number | null>(null);
  const [positions, setPositions] = useState<Pos[]>([]);
  const [maxPct, setMaxPct] = useState(
    DEFAULT_RISK_SETTINGS.maxPositionPctPerSymbol,
  );

  const load = useCallback(async () => {
    if (!session?.user) {
      setCash(null);
      setPositions([]);
      return;
    }
    try {
      const [a, p, r] = await Promise.all([
        fetch("/api/trading/account"),
        fetch("/api/trading/positions?quotes=1"),
        fetch("/api/trading/risk-settings"),
      ]);
      if (a.ok) {
        const aj = await a.json();
        setCash(aj.account?.cashBalance ?? null);
      }
      if (p.ok) {
        const pj = await p.json();
        setPositions(pj.positions ?? []);
      }
      if (r.ok) {
        const rj = await r.json();
        const m = rj.settings?.maxPositionPctPerSymbol;
        if (typeof m === "number" && m > 0) setMaxPct(m);
      }
    } catch {
      /* ignore */
    }
  }, [session?.user]);

  useEffect(() => {
    void load();
  }, [load, symbol, assetType, refreshKey]);

  if (status === "loading") return null;

  if (!session?.user) {
    return (
      <div className="aw-caption border-b border-[var(--border)] px-3 py-2.5 text-left">
        {t("loginHint")}{" "}
        <Link href="/login" className="aw-text-link">
          {t("login")}
        </Link>
      </div>
    );
  }

  if (cash == null) return null;

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
    <div className="space-y-2 border-b border-[var(--border)] px-3 py-2.5">
      <div className="grid grid-cols-2 gap-x-3">
        <Cell label={t("equity")} value={`$${money(equity)}`} primary />
        <Cell label={t("cash")} value={`$${money(cash)}`} primary />
      </div>
      <div className="grid grid-cols-2 gap-x-3 border-t border-[var(--border)] pt-2">
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
