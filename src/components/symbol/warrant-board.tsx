"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useMarketWarrants } from "@/hooks/query/use-market-warrants";
import { ListPanelSkeleton } from "@/components/ui/panel-skeleton";
import { formatNumber } from "@/lib/format-number";
import type { WarrantKind } from "@/lib/market/providers/longbridge-warrants";
import type { AssetType } from "@/lib/types";

const ALL_KINDS: WarrantKind[] = ["call", "put", "bull", "bear", "inline"];

function displayCode(sym: string) {
  const m = /^(\d+)\.HK$/i.exec(sym.trim());
  if (m) return `HK ${m[1]}`;
  return sym.replace(/\.HK$/i, "");
}

function asPctDisplay(n: number) {
  return Math.abs(n) > 0 && Math.abs(n) <= 1 ? n * 100 : n;
}

function fmtNum(
  n: number | null | undefined,
  opts?: { pct?: boolean; digits?: number },
) {
  if (n == null || !Number.isFinite(n)) return "—";
  const digits = opts?.digits ?? 3;
  const v = opts?.pct ? asPctDisplay(n) : n;
  const s = formatNumber(v, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return opts?.pct ? `${s}%` : s;
}

function TypeChecks({
  value,
  onChange,
}: {
  value: Set<WarrantKind>;
  onChange: (next: Set<WarrantKind>) => void;
}) {
  const t = useTranslations("symbol");
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {ALL_KINDS.map((k) => {
        const on = value.has(k);
        const id = `warrant-type-${k}`;
        return (
          <label
            key={k}
            htmlFor={id}
            className="inline-flex cursor-pointer items-center gap-1.5 text-[12px] tracking-[-0.08px] text-[var(--foreground)]"
          >
            <input
              id={id}
              type="checkbox"
              checked={on}
              onChange={() => {
                const next = new Set(value);
                if (on) {
                  if (next.size <= 1) return;
                  next.delete(k);
                } else {
                  next.add(k);
                }
                onChange(next);
              }}
              className="size-3.5 accent-[var(--brand)]"
            />
            {t(`warrantType.${k}`)}
          </label>
        );
      })}
    </div>
  );
}

export function WarrantBoard({
  symbol,
  assetType,
  lastPrice,
  emptyArt,
}: {
  symbol: string;
  assetType: AssetType;
  lastPrice: number | null;
  emptyArt?: ReactNode;
}) {
  const t = useTranslations("symbol");
  const [kinds, setKinds] = useState(() => new Set<WarrantKind>(ALL_KINDS));
  const typeList = useMemo(() => [...kinds], [kinds]);

  const query = useMarketWarrants({
    symbol,
    assetType,
    types: typeList,
    enabled: assetType === "hk",
  });
  const data = query.data;
  const rows = data?.rows ?? [];
  const unavailable = Boolean(data?.unavailable) || query.isError;
  const errMsg =
    data?.code === "LB_CONN_LIMIT"
      ? t("derivativesConnLimit")
      : data?.code === "LB_WARRANT_PACKAGE"
        ? t("warrantsNoPackage")
        : typeof data?.detail === "string"
          ? data.detail
          : unavailable
            ? t("warrantsEmpty")
            : null;

  const spot =
    lastPrice != null && lastPrice > 0
      ? formatNumber(lastPrice, {
          minimumFractionDigits: 3,
          maximumFractionDigits: 3,
        })
      : "—";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--aw-hairline,var(--border))] px-3 py-2 sm:px-4">
        <div className="min-w-0 text-[12px] tracking-[-0.08px]">
          <span className="font-medium text-[var(--foreground)]">
            {t("warrantsTitle")}
          </span>
          <span className="ml-2 tabular-nums text-[var(--muted)]">
            {symbol}
          </span>
          <span className="ml-2 font-medium tabular-nums text-[var(--up)]">
            {spot}
          </span>
        </div>
        <TypeChecks value={kinds} onChange={setKinds} />
      </div>

      {query.isLoading ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <ListPanelSkeleton rows={8} />
        </div>
      ) : unavailable || !rows.length ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
          {emptyArt}
          <p className="max-w-md text-[13px] font-medium tracking-[-0.08px] text-[var(--foreground)]">
            {t("warrantsEmpty")}
          </p>
          {errMsg ? (
            <p className="max-w-lg text-[12px] leading-relaxed text-[var(--muted)]">
              {errMsg}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full min-w-[52rem] border-collapse text-left text-[12px]">
            <thead className="sticky top-0 z-[1] bg-[var(--panel)]">
              <tr className="border-b border-[var(--aw-hairline,var(--border))] text-[var(--muted)]">
                <th className="px-3 py-2 font-medium">{t("warrantCol.code")}</th>
                <th className="px-3 py-2 font-medium">{t("warrantCol.name")}</th>
                <th className="px-2 py-2 text-right font-medium">
                  {t("warrantCol.callPrice")}
                </th>
                <th className="px-2 py-2 text-right font-medium">
                  {t("warrantCol.toCallPrice")}
                </th>
                <th className="px-2 py-2 text-right font-medium">
                  {t("warrantCol.effLev")}
                </th>
                <th className="px-2 py-2 text-right font-medium">
                  {t("warrantCol.levRatio")}
                </th>
                <th className="px-2 py-2 text-right font-medium">
                  {t("warrantCol.convRatio")}
                </th>
                <th className="px-2 py-2 text-right font-medium">
                  {t("warrantCol.balance")}
                </th>
                <th className="px-3 py-2 font-medium">
                  {t("warrantCol.status")}
                </th>
                <th className="px-3 py-2 font-medium">{t("warrantCol.type")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const eff = r.effectiveLeverage;
                const effCls =
                  eff == null
                    ? "text-[var(--foreground)]"
                    : eff >= 0
                      ? "text-[var(--up)]"
                      : "text-[var(--down)]";
                return (
                  <tr
                    key={r.symbol}
                    className="border-t border-[var(--aw-hairline,var(--border))] hover:bg-[color-mix(in_srgb,var(--muted)_6%,transparent)]"
                  >
                    <td className="px-3 py-2 font-medium tabular-nums tracking-[-0.08px] text-[var(--brand-text)]">
                      {displayCode(r.symbol)}
                    </td>
                    <td className="max-w-[10rem] truncate px-3 py-2 text-[var(--foreground)]">
                      {r.name || "—"}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {fmtNum(r.callPrice, { digits: 3 })}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums text-[var(--muted)]">
                      {fmtNum(r.toCallPrice, { digits: 2, pct: true })}
                    </td>
                    <td className={`px-2 py-2 text-right tabular-nums ${effCls}`}>
                      {fmtNum(eff, { digits: 2, pct: true })}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {fmtNum(r.leverageRatio, { digits: 2, pct: true })}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {fmtNum(r.conversionRatio, { digits: 0, pct: true })}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {fmtNum(r.balancePoint, { digits: 3 })}
                    </td>
                    <td className="px-3 py-2 text-[var(--muted)]">
                      {t(`warrantStatus.${r.status}`)}
                    </td>
                    <td className="px-3 py-2">{t(`warrantType.${r.type}`)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
