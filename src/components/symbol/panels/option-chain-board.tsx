"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ListPanelSkeleton } from "@/components/ui/panel-skeleton";
import { SideDrawer } from "@/components/ui/side-drawer";
import { formatNumber } from "@/lib/format-number";
import type { OptionRow } from "@/lib/market/providers/longbridge-research";
import type { AssetType } from "@/lib/types";
import { OptionChainPanes } from "./option-chain/option-chain-panes";
import type { StrategySeed } from "./option-chain/option-strategy-drawer";
import { OptionStrategyDrawerLoading } from "./option-chain/option-strategy-drawer-loading";
import { OptionChainSettings } from "./option-chain/option-chain-settings";
import {
  DEFAULT_OPTION_CHAIN_PREFS,
  limitRowsAroundSpot,
  loadOptionChainPrefs,
  orderedVisibleCols,
  saveOptionChainPrefs,
  type OptionChainPrefs,
} from "./option-chain/option-chain-prefs";
import {
  bsGreeks,
  daysToExpiry,
  expiryChipLabel,
  mergeStrikes,
  type Greeks,
  type MoneyFilter,
  type SideFilter,
} from "./option-chain/option-chain-utils";

/**
 * Heavy body (pricer / payoff / date picker) loads on first open.
 * SideDrawer shell stays in this chunk so the panel slides in immediately.
 */
const OptionStrategyDrawerBody = dynamic(
  () =>
    import("./option-chain/option-strategy-drawer").then((m) => ({
      default: m.OptionStrategyDrawerBody,
    })),
  {
    ssr: false,
    loading: () => <OptionStrategyDrawerLoading />,
  },
);

function avgIv(rows: OptionRow[]): number | null {
  const vals = rows
    .map((r) => r.iv)
    .filter((v): v is number => v != null && v > 0)
    .map((v) => (v > 2 ? v : v * 100));
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
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
      className="inline-flex h-7 shrink-0 overflow-hidden rounded-[var(--radius-control,4px)] border border-[var(--aw-hairline,var(--border))]"
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
                ? "bg-[var(--aw-primary,var(--brand))] font-medium text-white"
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

export function OptionChainBoard({
  expiries,
  expiry,
  onExpiryChange,
  calls,
  puts,
  spot,
  symbol,
  assetType,
  loading,
  empty,
}: {
  expiries: string[];
  expiry: string;
  onExpiryChange: (v: string) => void;
  calls: OptionRow[];
  puts: OptionRow[];
  spot: number | null;
  symbol?: string;
  assetType?: AssetType;
  loading?: boolean;
  empty?: string | null;
}) {
  const t = useTranslations("symbol");
  const [side, setSide] = useState<SideFilter>("all");
  const [money, setMoney] = useState<MoneyFilter>("all");
  const [toolOpen, setToolOpen] = useState(false);
  /** Keep shell mounted after first open so close animation still has a host. */
  const [toolMounted, setToolMounted] = useState(false);
  const [seed, setSeed] = useState<StrategySeed>(null);
  const [prefs, setPrefs] = useState<OptionChainPrefs>(DEFAULT_OPTION_CHAIN_PREFS);
  const chipRef = useRef<HTMLDivElement>(null);
  const tTool = useTranslations("symbol.optTool");

  useEffect(() => {
    setPrefs(loadOptionChainPrefs());
  }, []);

  const onPrefsChange = useCallback((next: OptionChainPrefs) => {
    const normalized: OptionChainPrefs = {
      ...next,
      cols: orderedVisibleCols(next.cols),
    };
    setPrefs(normalized);
    saveOptionChainPrefs(normalized);
  }, []);

  const openTool = useCallback(() => {
    setToolMounted(true);
    setToolOpen(true);
  }, []);

  const pickSeed = useCallback((s: { kind: "call" | "put"; strike: number }) => {
    setSeed(s);
    setToolMounted(true);
    setToolOpen(true);
  }, []);

  const scrollChips = (dir: number) => {
    chipRef.current?.scrollBy({ left: dir * 240, behavior: "smooth" });
  };

  const rows = useMemo(() => mergeStrikes(calls, puts), [calls, puts]);
  const spotN = spot != null && spot > 0 ? spot : null;
  const dte = useMemo(() => daysToExpiry(expiry), [expiry]);

  /*
   * Dual call+put (Futu-style): keep every strike row; blank the side that
   * fails moneyness inside the panes. Single-side view still filters rows.
   */
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (side === "call" && !r.call) return false;
      if (side === "put" && !r.put) return false;
      if (!spotN || money === "all" || side === "all") return true;
      const callItm = r.strike < spotN;
      const putItm = r.strike > spotN;
      if (money === "itm") {
        return side === "call" ? callItm : putItm;
      }
      return side === "call" ? !callItm : !putItm;
    });
  }, [rows, side, money, spotN]);

  const visibleCols = useMemo(
    () => orderedVisibleCols(prefs.cols),
    [prefs.cols],
  );

  const displayed = useMemo(
    () => limitRowsAroundSpot(filtered, spotN, prefs.rowLimit),
    [filtered, spotN, prefs.rowLimit],
  );

  const greeksBySide = useMemo(() => {
    const call = new Map<number, Greeks>();
    const put = new Map<number, Greeks>();
    if (spotN) {
      for (const r of rows) {
        if (r.call) {
          call.set(
            r.strike,
            bsGreeks(spotN, r.strike, r.call.iv, dte, true, r.call.last),
          );
        }
        if (r.put) {
          put.set(
            r.strike,
            bsGreeks(spotN, r.strike, r.put.iv, dte, false, r.put.last),
          );
        }
      }
    }
    return { call, put };
  }, [rows, spotN, dte]);

  const callOi = calls.reduce((s, r) => s + (r.oi || 0), 0);
  const putOi = puts.reduce((s, r) => s + (r.oi || 0), 0);
  const chainIv = avgIv([...calls, ...puts]);
  const showCall = side !== "put";
  const showPut = side !== "call";

  /** Insert spot marker after last strike strictly below spot. */
  const spotAfterIdx = useMemo(() => {
    if (spotN == null || !displayed.length) return -1;
    let idx = -1;
    for (let i = 0; i < displayed.length; i++) {
      if (displayed[i]!.strike < spotN) idx = i;
      else break;
    }
    return idx;
  }, [displayed, spotN]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-2 px-3 py-2 sm:px-4">
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
        <OptionChainSettings prefs={prefs} onChange={onPrefsChange} />
        <button
          type="button"
          onClick={openTool}
          onMouseEnter={() => {
            void import("./option-chain/option-strategy-drawer");
          }}
          style={{ color: "var(--brand)" }}
          className="ml-auto inline-flex items-center text-[13px] font-medium tracking-[-0.08px] transition hover:underline"
        >
          {t("openOptionsTool")}
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1 py-2 pl-3 pr-2 sm:pl-4">
        <div
          ref={chipRef}
          className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {expiries.map((d) => {
            const on = d === expiry;
            return (
              <button
                key={d}
                type="button"
                onClick={() => onExpiryChange(d)}
                className={`shrink-0 rounded border px-3 py-1 text-[12px] tabular-nums tracking-[-0.08px] transition-colors ${
                  on
                    ? "border-[var(--brand)]/40 bg-[var(--brand-soft)] font-medium text-[var(--brand-text)]"
                    : "border-[var(--aw-hairline,var(--border))] bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {expiryChipLabel(
                  d,
                  (n) => t("optExpiryDays", { n }),
                  t("optExpiryExpired"),
                )}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          aria-label="scroll expiries left"
          onClick={() => scrollChips(-1)}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[var(--aw-hairline,var(--border))] bg-[var(--panel)] text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="scroll expiries right"
          onClick={() => scrollChips(1)}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[var(--aw-hairline,var(--border))] bg-[var(--panel)] text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          ›
        </button>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--aw-hairline,var(--border))] px-3 py-1.5 text-[12px] tabular-nums tracking-[-0.08px] text-[var(--muted)] sm:px-4">
        <span>
          {t("optFilterCall")}{" "}
          {formatNumber(callOi, { maximumFractionDigits: 0 })}
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
          {t("optFilterPut")} {formatNumber(putOi, { maximumFractionDigits: 0 })}
          {t("optContractsUnit")}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {loading ? (
          <div className="w-full overflow-auto p-3">
            <ListPanelSkeleton rows={8} />
          </div>
        ) : empty && !filtered.length ? (
          <p className="flex min-h-[12rem] w-full items-center justify-center px-4 text-center text-[13px] text-[var(--muted)]">
            {empty}
          </p>
        ) : (
          <OptionChainPanes
            rows={displayed}
            spotN={spotN}
            spotAfterIdx={spotAfterIdx}
            greeksBySide={greeksBySide}
            showCall={showCall}
            showPut={showPut}
            money={money}
            cols={visibleCols}
            symbol={symbol}
            seed={seed}
            onPickSeed={pickSeed}
            t={t}
          />
        )}
      </div>

      {toolMounted ? (
        <SideDrawer
          open={toolOpen}
          onClose={() => setToolOpen(false)}
          title={tTool("title")}
          subtitle={`${symbol ?? ""} · ${expiry}`}
          className="aw !bg-[var(--panel)]"
        >
          <OptionStrategyDrawerBody
            open={toolOpen}
            symbol={symbol ?? ""}
            assetType={assetType ?? "stock"}
            spot={spotN ?? 0}
            expiry={expiry}
            expiries={expiries}
            rows={displayed}
            seed={seed}
          />
        </SideDrawer>
      ) : null}
    </div>
  );
}
