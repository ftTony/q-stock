"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { formatNumber } from "@/lib/format-number";
import type { OptionRow } from "@/lib/market/providers/longbridge-research";

type SideFilter = "all" | "call" | "put";
type MoneyFilter = "all" | "itm" | "otm";

type StrikeRow = {
  strike: number;
  call?: OptionRow;
  put?: OptionRow;
};

function mergeStrikes(calls: OptionRow[], puts: OptionRow[]): StrikeRow[] {
  const map = new Map<number, StrikeRow>();
  for (const c of calls) {
    const prev = map.get(c.strike);
    map.set(c.strike, { strike: c.strike, call: c, put: prev?.put });
  }
  for (const p of puts) {
    const prev = map.get(p.strike);
    map.set(p.strike, { strike: p.strike, call: prev?.call, put: p });
  }
  return [...map.values()].sort((a, b) => a.strike - b.strike);
}

function fmtPx(n: number | null | undefined) {
  if (n == null || !(n > 0)) return "—";
  return formatNumber(n, { maximumFractionDigits: 3 });
}

function fmtIv(iv: number | null | undefined) {
  if (iv == null || !(iv > 0)) return null;
  const pct = iv > 2 ? iv : iv * 100;
  return formatNumber(pct, { maximumFractionDigits: 1 });
}

function avgIv(rows: OptionRow[]): number | null {
  const vals = rows
    .map((r) => r.iv)
    .filter((v): v is number => v != null && v > 0)
    .map((v) => (v > 2 ? v : v * 100));
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function expiryChipLabel(ymd: string, daysLabel: (n: number) => string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return ymd;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const exp = Date.UTC(y, mo - 1, d);
  const today = new Date();
  const start = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const days = Math.max(0, Math.round((exp - start) / 86_400_000));
  return `${mo}/${d} (${daysLabel(days)})`;
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
}) {
  return (
    <div
      role="group"
      className="inline-flex h-7 shrink-0 overflow-hidden rounded border border-[var(--aw-hairline,var(--border))]"
    >
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`px-2.5 text-[12px] tracking-[-0.08px] transition-colors ${
              on
                ? "bg-[var(--foreground)] font-medium text-[var(--background)]"
                : "bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function PxCell({
  value,
  tone,
}: {
  value: string;
  tone?: "bid" | "ask" | "mid" | "plain";
}) {
  const base =
    "mx-auto flex h-7 min-w-[3.25rem] max-w-full items-center justify-center rounded px-1.5 text-[12px] tabular-nums tracking-[-0.08px]";
  if (tone === "ask") {
    return (
      <span
        className={`${base} bg-[color-mix(in_srgb,var(--up)_14%,transparent)] text-[var(--foreground)]`}
      >
        {value}
      </span>
    );
  }
  if (tone === "bid") {
    return (
      <span
        className={`${base} bg-[color-mix(in_srgb,var(--down)_14%,transparent)] text-[var(--foreground)]`}
      >
        {value}
      </span>
    );
  }
  return <span className={`${base} text-[var(--foreground)]`}>{value}</span>;
}

function chgLabel(chg: number | null | undefined) {
  if (chg == null || !Number.isFinite(chg)) return "—";
  const sign = chg > 0 ? "+" : "";
  return `${sign}${formatNumber(chg, { maximumFractionDigits: 1 })}%`;
}

function SpotAnchor({ price }: { price: number }) {
  return (
    <div className="relative flex h-0 items-center justify-center">
      <div className="absolute inset-x-0 border-t border-dashed border-[var(--aw-hairline,var(--border))]" />
      <span className="relative z-[1] rounded-full border border-[var(--aw-hairline,var(--border))] bg-[var(--panel)] px-2.5 py-0.5 text-[11px] font-semibold tabular-nums tracking-[-0.08px] text-[var(--foreground)] shadow-sm">
        {formatNumber(price, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    </div>
  );
}

function StrikeRowView({
  strike,
  showCall,
  showPut,
  itmCallBg,
  itmPutBg,
  callLast,
  callChg,
  callChgTone,
  callIv,
  putIv,
  putChg,
  putChgTone,
  putLast,
  spotAfter,
  colCount,
}: {
  strike: number;
  showCall: boolean;
  showPut: boolean;
  itmCallBg: string;
  itmPutBg: string;
  callLast: string;
  callChg: string;
  callChgTone: "ask" | "bid" | "plain";
  callIv: string;
  putIv: string;
  putChg: string;
  putChgTone: "ask" | "bid" | "plain";
  putLast: string;
  spotAfter: number | null;
  colCount: number;
}) {
  return (
    <>
      <tr className="border-t border-[var(--aw-hairline,var(--border))]">
        {showCall ? (
          <>
            <td className={`px-1 py-1 ${itmCallBg}`}>
              <PxCell value={callLast} tone="mid" />
            </td>
            <td className={`px-1 py-1 ${itmCallBg}`}>
              <PxCell value={callChg} tone={callChgTone} />
            </td>
            <td className={`px-1 py-1 ${itmCallBg}`}>
              <PxCell value={callIv} tone="bid" />
            </td>
          </>
        ) : null}
        <td className="px-2 py-1.5 text-[13px] font-semibold tabular-nums tracking-[-0.08px] text-[var(--foreground)]">
          {formatNumber(strike, { maximumFractionDigits: 2 })}
        </td>
        {showPut ? (
          <>
            <td className={`px-1 py-1 ${itmPutBg}`}>
              <PxCell value={putIv} tone="bid" />
            </td>
            <td className={`px-1 py-1 ${itmPutBg}`}>
              <PxCell value={putChg} tone={putChgTone} />
            </td>
            <td className={`px-1 py-1 ${itmPutBg}`}>
              <PxCell value={putLast} tone="mid" />
            </td>
          </>
        ) : null}
      </tr>
      {spotAfter != null ? (
        <tr>
          <td colSpan={colCount} className="p-0">
            <SpotAnchor price={spotAfter} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

export function OptionChainBoard({
  expiries,
  expiry,
  onExpiryChange,
  calls,
  puts,
  spot,
  loading,
  empty,
  toolsHref,
}: {
  expiries: string[];
  expiry: string;
  onExpiryChange: (v: string) => void;
  calls: OptionRow[];
  puts: OptionRow[];
  spot: number | null;
  loading?: boolean;
  empty?: string | null;
  toolsHref: string;
}) {
  const t = useTranslations("symbol");
  const [side, setSide] = useState<SideFilter>("all");
  const [money, setMoney] = useState<MoneyFilter>("all");

  const rows = useMemo(() => mergeStrikes(calls, puts), [calls, puts]);
  const spotN = spot != null && spot > 0 ? spot : null;

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (side === "call" && !r.call) return false;
      if (side === "put" && !r.put) return false;
      if (!spotN || money === "all") return true;
      const callItm = r.strike < spotN;
      const putItm = r.strike > spotN;
      if (money === "itm") {
        if (side === "call") return callItm;
        if (side === "put") return putItm;
        return callItm || putItm;
      }
      if (side === "call") return !callItm;
      if (side === "put") return !putItm;
      return !callItm || !putItm;
    });
  }, [rows, side, money, spotN]);

  const callOi = calls.reduce((s, r) => s + (r.oi || 0), 0);
  const putOi = puts.reduce((s, r) => s + (r.oi || 0), 0);
  const chainIv = avgIv([...calls, ...puts]);
  const showCall = side !== "put";
  const showPut = side !== "call";

  /** Insert spot marker after last strike strictly below spot. */
  const spotAfterIdx = useMemo(() => {
    if (spotN == null || !filtered.length) return -1;
    let idx = -1;
    for (let i = 0; i < filtered.length; i++) {
      if (filtered[i]!.strike < spotN) idx = i;
      else break;
    }
    return idx;
  }, [filtered, spotN]);

  const colCount =
    (showCall ? 3 : 0) + 1 + (showPut ? 3 : 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--aw-hairline,var(--border))] px-3 py-2 sm:px-4">
        <Segmented
          value={side}
          onChange={setSide}
          options={[
            { id: "all", label: t("optFilterAll") },
            { id: "call", label: t("optFilterCall") },
            { id: "put", label: t("optFilterPut") },
          ]}
        />
        <Segmented
          value={money}
          onChange={setMoney}
          options={[
            { id: "all", label: t("optFilterAll") },
            { id: "itm", label: t("optFilterItm") },
            { id: "otm", label: t("optFilterOtm") },
          ]}
        />
        {chainIv != null ? (
          <span className="text-[12px] tabular-nums text-[var(--muted)]">
            IV {formatNumber(chainIv, { maximumFractionDigits: 1 })}
          </span>
        ) : null}
        <Link
          href={toolsHref}
          className="ml-auto inline-flex h-7 items-center rounded bg-[color-mix(in_srgb,#b45309_88%,#000)] px-2.5 text-[12px] font-medium text-white hover:opacity-90"
        >
          {t("openOptionsTool")}
        </Link>
      </div>

      <div className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-[var(--aw-hairline,var(--border))] px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-4 [&::-webkit-scrollbar]:hidden">
        {expiries.map((d) => {
          const on = d === expiry;
          return (
            <button
              key={d}
              type="button"
              onClick={() => onExpiryChange(d)}
              className={`shrink-0 rounded-full border px-3 py-1 text-[12px] tabular-nums tracking-[-0.08px] transition-colors ${
                on
                  ? "border-[var(--foreground)] bg-[var(--foreground)] font-medium text-[var(--background)]"
                  : "border-[var(--aw-hairline,var(--border))] bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {expiryChipLabel(d, (n) => t("optExpiryDays", { n }))}
            </button>
          );
        })}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--aw-hairline,var(--border))] px-3 py-1.5 text-[12px] tabular-nums tracking-[-0.08px] text-[var(--muted)] sm:px-4">
        <span>
          Call {formatNumber(callOi, { maximumFractionDigits: 0 })}
          {t("optContractsUnit")}
        </span>
        <span className="text-center">
          {chainIv != null
            ? `IV ${formatNumber(chainIv, { maximumFractionDigits: 2 })}%`
            : "IV —"}
          {spotN != null
            ? ` · ${t("underlyingSpot")} ${formatNumber(spotN, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : null}
        </span>
        <span>
          Put {formatNumber(putOi, { maximumFractionDigits: 0 })}
          {t("optContractsUnit")}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {loading ? (
          <p className="aw-caption flex min-h-[12rem] items-center justify-center">
            …
          </p>
        ) : empty && !filtered.length ? (
          <p className="flex min-h-[12rem] items-center justify-center px-4 text-center text-[13px] text-[var(--muted)]">
            {empty}
          </p>
        ) : (
          <table className="w-full min-w-[36rem] border-collapse text-center text-[12px]">
            <thead className="sticky top-0 z-[1] bg-[var(--panel)]">
              <tr className="border-b border-[var(--aw-hairline,var(--border))] text-[var(--muted)]">
                {showCall ? (
                  <>
                    <th className="px-1 py-2 font-medium">{t("optCol.last")}</th>
                    <th className="px-1 py-2 font-medium text-[var(--up)]">
                      {t("optCol.chg")}
                    </th>
                    <th className="px-1 py-2 font-medium text-[var(--down)]">
                      {t("optCol.iv")}
                    </th>
                  </>
                ) : null}
                <th className="px-2 py-2 font-semibold text-[var(--foreground)]">
                  {t("optCol.strike")}
                </th>
                {showPut ? (
                  <>
                    <th className="px-1 py-2 font-medium text-[var(--down)]">
                      {t("optCol.iv")}
                    </th>
                    <th className="px-1 py-2 font-medium text-[var(--up)]">
                      {t("optCol.chg")}
                    </th>
                    <th className="px-1 py-2 font-medium">{t("optCol.last")}</th>
                  </>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {spotAfterIdx < 0 && spotN != null ? (
                <tr key="spot-top">
                  <td colSpan={colCount} className="p-0">
                    <SpotAnchor price={spotN} />
                  </td>
                </tr>
              ) : null}
              {filtered.map((r, i) => {
                const callItm = spotN != null && r.strike < spotN;
                const putItm = spotN != null && r.strike > spotN;
                const ivC = fmtIv(r.call?.iv ?? null);
                const ivP = fmtIv(r.put?.iv ?? null);
                const chgC = r.call?.chgPct;
                const chgP = r.put?.chgPct;
                const itmCallBg = callItm
                  ? "bg-[color-mix(in_srgb,var(--muted)_8%,transparent)]"
                  : "";
                const itmPutBg = putItm
                  ? "bg-[color-mix(in_srgb,var(--muted)_8%,transparent)]"
                  : "";

                return (
                  <StrikeRowView
                    key={r.strike}
                    strike={r.strike}
                    showCall={showCall}
                    showPut={showPut}
                    itmCallBg={itmCallBg}
                    itmPutBg={itmPutBg}
                    callLast={fmtPx(r.call?.last)}
                    callChg={chgLabel(chgC)}
                    callChgTone={
                      chgC == null ? "plain" : chgC >= 0 ? "ask" : "bid"
                    }
                    callIv={ivC != null ? `${ivC}%` : "—"}
                    putIv={ivP != null ? `${ivP}%` : "—"}
                    putChg={chgLabel(chgP)}
                    putChgTone={
                      chgP == null ? "plain" : chgP >= 0 ? "ask" : "bid"
                    }
                    putLast={fmtPx(r.put?.last)}
                    spotAfter={spotAfterIdx === i ? spotN : null}
                    colCount={colCount}
                  />
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
