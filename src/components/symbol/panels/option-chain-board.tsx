"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { ListPanelSkeleton } from "@/components/ui/panel-skeleton";
import { SideDrawer } from "@/components/ui/side-drawer";
import { formatNumber } from "@/lib/format-number";
import type { OptionChainStats } from "@/lib/market/providers/futu-options";
import type { OptionRow } from "@/lib/market/providers/longbridge-research";
import type { AssetType } from "@/lib/types";
import { OptionChainPanes } from "./option-chain/option-chain-panes";
import type { StrategySeed } from "./option-chain/option-strategy-drawer";
import { OptionStrategyDrawerLoading } from "./option-chain/option-strategy-drawer-loading";
import { OptionChainSettings } from "./option-chain/option-chain-settings";
import {
  ExpandGlyph,
  Segmented,
} from "./option-chain/option-chain-controls";
import { fmtContractCount } from "./option-chain/option-chain-format";
import {
  DEFAULT_OPTION_CHAIN_PREFS,
  limitRowsAroundSpot,
  loadOptionChainPrefs,
  orderedVisibleCols,
  saveOptionChainPrefs,
  type OptionChainPrefs,
} from "./option-chain/option-chain-prefs";
import {
  atmIv,
  bsGreeks,
  daysToExpiry,
  expiryChipLabel,
  mergeStrikes,
  sumVolume,
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

export function OptionChainBoard({
  expiries,
  expiry,
  onExpiryChange,
  calls,
  puts,
  spot,
  stats = null,
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
  /** Futu desk stats: underlying IV + per-expiry IV / EM / volumes. */
  stats?: OptionChainStats | null;
  symbol?: string;
  assetType?: AssetType;
  loading?: boolean;
  empty?: string | null;
}) {
  const t = useTranslations("symbol");
  const locale = useLocale();
  const [side, setSide] = useState<SideFilter>("all");
  const [money, setMoney] = useState<MoneyFilter>("all");
  const [toolOpen, setToolOpen] = useState(false);
  /** Keep shell mounted after first open so close animation still has a host. */
  const [toolMounted, setToolMounted] = useState(false);
  const [seed, setSeed] = useState<StrategySeed>(null);
  const [prefs, setPrefs] = useState<OptionChainPrefs>(DEFAULT_OPTION_CHAIN_PREFS);
  const [expanded, setExpanded] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const chipRef = useRef<HTMLDivElement>(null);
  const tTool = useTranslations("symbol.optTool");

  useEffect(() => {
    setPrefs(loadOptionChainPrefs());
  }, []);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [expanded]);

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

  const expiryStat = stats?.byExpiry[expiry];
  // Prefer Futu desk stats (matches Niuniu header); fall back to local sums / ATM.
  const callVol = expiryStat?.callVolume ?? sumVolume(calls);
  const putVol = expiryStat?.putVolume ?? sumVolume(puts);
  const chainIv = expiryStat?.iv ?? atmIv(calls, puts, spotN);
  const underlyingIv = stats?.underlyingIv ?? null;
  const expectedMove = expiryStat?.expectedMove ?? null;
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

  const board = (
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
        {underlyingIv != null ? (
          <span
            className="text-[12px] tabular-nums text-[var(--muted)]"
            title={t("optUnderlyingIv")}
          >
            IV {formatNumber(underlyingIv, { maximumFractionDigits: 2 })}%
          </span>
        ) : chainIv != null ? (
          <span className="text-[12px] tabular-nums text-[var(--muted)]">
            IV {formatNumber(chainIv, { maximumFractionDigits: 1 })}%
          </span>
        ) : null}
        <OptionChainSettings prefs={prefs} onChange={onPrefsChange} />
        <div className="ml-auto inline-flex items-center gap-2">
          {/* Expand lives only in the compact stack pane; header owns exit when fullscreen. */}
          {!expanded ? (
            <button
              type="button"
              title={t("fullscreen")}
              aria-label={t("fullscreen")}
              onClick={() => setExpanded(true)}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              <ExpandGlyph expanded={false} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={openTool}
            onMouseEnter={() => {
              void import("./option-chain/option-strategy-drawer");
            }}
            style={{ color: "var(--brand)" }}
            className="inline-flex items-center text-[13px] font-medium tracking-[-0.08px] transition hover:underline"
          >
            {t("openOptionsTool")}
          </button>
        </div>
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
          {fmtContractCount(callVol, locale)}
          {t("optContractsUnit")}
        </span>
        <span className="text-center">
          {chainIv != null
            ? `IV ${formatNumber(chainIv, { maximumFractionDigits: 2 })}%`
            : "IV —"}
          {expectedMove != null
            ? ` · EM ±${formatNumber(expectedMove, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 3,
              })}`
            : null}
          {spotN != null
            ? ` · ${t("underlyingSpot")} ${formatNumber(spotN, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : null}
        </span>
        <span>
          {t("optFilterPut")} {fmtContractCount(putVol, locale)}
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

  if (expanded && portalReady) {
    return (
      <>
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
          <p className="text-[12px] text-[var(--muted)]">{t("fullscreen")}</p>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="text-[13px] font-medium text-[var(--brand-text,var(--brand))] hover:underline"
          >
            {t("exitFullscreen")}
          </button>
        </div>
        {createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("fullscreen")}
            /* Override .aw { background: parchment } — fullscreen needs solid panel. */
            className="aw fixed inset-0 z-[65] flex flex-col !bg-[var(--panel)]"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--aw-hairline,var(--border))] bg-[var(--panel)] px-4 py-2">
              <div className="min-w-0 truncate text-[13px] font-medium tracking-[-0.08px] text-[var(--foreground)]">
                {symbol ? `${symbol} · ` : null}
                {t("derivativesTitle")}
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                title={t("exitFullscreen")}
                aria-label={t("exitFullscreen")}
                className="inline-flex h-8 items-center gap-1.5 px-2 text-[12px] text-[var(--muted)] transition hover:text-[var(--foreground)]"
              >
                <ExpandGlyph expanded />
                {t("exitFullscreen")}
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--panel)]">
              {board}
            </div>
          </div>,
          document.body,
        )}
      </>
    );
  }

  return board;
}
