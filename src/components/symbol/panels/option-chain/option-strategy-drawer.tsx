"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { SideDrawer } from "@/components/ui/side-drawer";
import { QtSelect } from "@/components/ui/qt-select";
import { fetchJson } from "@/lib/query/fetch-json";
import { formatNumber } from "@/lib/format-number";
import type { OptionRow } from "@/lib/market/providers/longbridge-research";
import type { AssetType } from "@/lib/types";
import { daysToExpiry, mergeStrikes } from "./option-chain-utils";
import type { StrikeRow } from "./option-chain-utils";
import { calcOption } from "./option-calculator";
import {
  availableStrikes,
  buildLegs,
  DUAL_EXPIRY_STRATEGIES,
  evaluateStrategy,
  premiumFromChain,
  STRATEGY_IDS,
  strategyGlyph,
  strategyLabelKey,
} from "./option-strategy-utils";
import type { PricedLeg, StrategyId, StrategyLeg } from "./option-strategy-utils";
import { ContractQuote } from "./drawer/contract-quote";
import { LegBook } from "./drawer/leg-book";
import { OptionCalculatorCard } from "./drawer/option-calculator-card";
import { PayoffChart } from "./drawer/payoff-chart";
import { StrategyLegsTable } from "./drawer/strategy-legs-table";
import {
  DEFAULT_RATE_PCT,
  QT_TRIGGER,
  SECTION_CLS,
  fmtMoney,
} from "./drawer/drawer-ui";

export type StrategySeed = { kind: "call" | "put"; strike: number } | null;

type ChainResponse = {
  unavailable?: boolean;
  calls?: unknown[];
  puts?: unknown[];
};

function optionFor(
  rows: StrikeRow[],
  kind: "call" | "put",
  strike: number | null,
): OptionRow | undefined {
  if (strike == null) return undefined;
  const r = rows.find((x) => x.strike === strike);
  return kind === "call" ? r?.call : r?.put;
}

/**
 * Options tool drawer: contract quote on top, then the P&L strategy builder
 * (chips → order book → legs → metrics → payoff chart), then the calculator.
 * Presentation pieces live in ./drawer/*; this file owns state and data.
 */
export function OptionStrategyDrawer({
  open,
  onClose,
  symbol,
  assetType,
  spot,
  expiry,
  expiries,
  rows,
  seed,
}: {
  open: boolean;
  onClose: () => void;
  symbol: string;
  assetType: AssetType;
  spot: number;
  expiry: string;
  expiries: string[];
  rows: StrikeRow[];
  seed: StrategySeed;
}) {
  const t = useTranslations("symbol.optTool");
  const [strategy, setStrategy] = useState<StrategyId>("single");
  const [long, setLong] = useState(true);
  const [verticalKind, setVerticalKind] = useState<"call" | "put">("call");
  const [legs, setLegs] = useState<StrategyLeg[]>([]);

  /* Target contract for the quote card + calculator (follows the chain seed). */
  const [quoteKind, setQuoteKind] = useState<"call" | "put">(seed?.kind ?? "call");
  const [quoteStrike, setQuoteStrike] = useState<number>(seed?.strike ?? 0);

  const needsFar = DUAL_EXPIRY_STRATEGIES.includes(strategy);
  const farDefault = useMemo(() => {
    const idx = expiries.indexOf(expiry);
    return expiries[idx + 1] ?? expiries[idx - 1] ?? expiry;
  }, [expiries, expiry]);
  const [farExpiry, setFarExpiry] = useState(farDefault);
  useEffect(() => setFarExpiry(farDefault), [farDefault]);

  /** Rebuild legs when the structure (not the strikes) changes. */
  useEffect(() => {
    if (!open) return;
    setLegs(
      buildLegs({
        strategy,
        spot,
        expiry,
        expiryFar: farExpiry,
        rows,
        seed,
        long,
        verticalKind,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, strategy, long, verticalKind, farExpiry, expiry, seed, rows.length]);

  /** Calendar / diagonal need the far expiry's chain for premiums. */
  const farQuery = useQuery({
    queryKey: ["market", "options", assetType, symbol, farExpiry, spot] as const,
    enabled: open && needsFar && Boolean(farExpiry),
    staleTime: 30_000,
    queryFn: () => {
      const qs = new URLSearchParams({
        symbol,
        assetType,
        expiry: farExpiry,
        spot: String(spot),
      });
      return fetchJson<ChainResponse>(`/api/market/options?${qs}`);
    },
  });
  const farRows: StrikeRow[] = useMemo(() => {
    if (!needsFar) return [];
    const calls = (farQuery.data?.calls ?? []) as OptionRow[];
    const puts = (farQuery.data?.puts ?? []) as OptionRow[];
    return mergeStrikes(calls, puts);
  }, [needsFar, farQuery.data]);

  const pricedLegs: PricedLeg[] = useMemo(
    () =>
      legs.map((l) => {
        if (l.kind === "stock") return { ...l, premium: null };
        const src = l.expiry === farExpiry && needsFar ? farRows : rows;
        return { ...l, premium: premiumFromChain(src, l.kind, l.strike ?? 0) };
      }),
    [legs, rows, farRows, farExpiry, needsFar],
  );

  const eval_ = useMemo(() => evaluateStrategy(pricedLegs, spot), [pricedLegs, spot]);

  const strikes = useMemo(() => availableStrikes(rows), [rows]);
  const farStrikes = useMemo(
    () => (needsFar && farRows.length ? availableStrikes(farRows) : strikes),
    [needsFar, farRows, strikes],
  );

  const setLeg = (i: number, patch: Partial<StrategyLeg>) =>
    setLegs((prev) => prev.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  const strikeMarks = useMemo(
    () => [
      ...new Set(
        pricedLegs
          .filter((l) => l.kind !== "stock" && l.strike != null)
          .map((l) => l.strike as number),
      ),
    ],
    [pricedLegs],
  );

  const metrics = [
    {
      label: t("netPremium"),
      value:
        eval_.netPremium === 0
          ? "$0"
          : `${eval_.netPremium > 0 ? "+" : "-"}$${formatNumber(
              Math.abs(eval_.netPremium),
              { maximumFractionDigits: 0 },
            )}`,
      tone: eval_.netPremium > 0 ? "text-[var(--up)]" : "text-[var(--down)]",
    },
    {
      label: t("maxProfit"),
      value: fmtMoney(eval_.maxProfit),
      tone: "text-[var(--up)]",
    },
    {
      label: t("maxLoss"),
      value: eval_.maxLoss == null ? "-∞" : fmtMoney(eval_.maxLoss),
      tone: "text-[var(--down)]",
    },
    {
      label: t("breakevens"),
      value:
        eval_.breakevens.length > 0
          ? eval_.breakevens
              .map((b) => formatNumber(b, { maximumFractionDigits: 2 }))
              .join(" / ")
          : "—",
      tone: "",
    },
  ];

  // Align the quote target with the chain seed when it changes.
  useEffect(() => {
    if (!open) return;
    if (seed) {
      setQuoteKind(seed.kind);
      setQuoteStrike(seed.strike);
    } else if (strikes.length && !quoteStrike) {
      setQuoteStrike(
        strikes.reduce((a, b) => (Math.abs(b - spot) < Math.abs(a - spot) ? b : a)),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, seed]);

  /* Contract quote (top of drawer, follows the quote target). */
  const quoteRow = quoteStrike
    ? optionFor(rows, quoteKind, quoteStrike)
    : undefined;
  const quotePremium = quoteStrike
    ? premiumFromChain(rows, quoteKind, quoteStrike)
    : null;
  const quoteGreeks = useMemo(
    () =>
      quoteStrike
        ? calcOption({
            spot,
            strike: quoteStrike,
            ivPct: quoteRow?.iv ?? 0,
            days: daysToExpiry(expiry),
            ratePct: DEFAULT_RATE_PCT,
            isCall: quoteKind === "call",
            model: "american",
          })
        : null,
    [spot, quoteStrike, quoteKind, expiry, quoteRow?.iv],
  );

  const qt = (
    value: string,
    onChange: (v: string) => void,
    options: { value: string; label: string }[],
    aria: string,
  ) => (
    <QtSelect
      value={value}
      onChange={onChange}
      options={options}
      triggerClassName={QT_TRIGGER}
      aria-label={aria}
    />
  );

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title={t("title")}
      subtitle={`${symbol} · ${expiry}`}
    >
      <div className="flex flex-col gap-3 p-4 text-[12px]">
        {/* contract quote detail (top) */}
        {quoteStrike ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              {qt(
                quoteKind,
                (v) => setQuoteKind(v as "call" | "put"),
                [
                  { value: "call", label: t("callOpt") },
                  { value: "put", label: t("putOpt") },
                ],
                "quote kind",
              )}
              {qt(
                String(quoteStrike),
                (v) => setQuoteStrike(Number(v)),
                strikes.map((s) => ({
                  value: String(s),
                  label: formatNumber(s, { maximumFractionDigits: 3 }),
                })),
                "quote strike",
              )}
            </div>
            <ContractQuote
              row={quoteRow}
              greeks={quoteGreeks}
              premium={quotePremium}
              spot={spot}
              strike={quoteStrike}
              isCall={quoteKind === "call"}
              expiry={expiry}
              symbol={symbol}
              t={t}
            />
            {/* order book of the quoted contract (replaces the old mark row) */}
            {quoteRow ? (
              <div className="mt-2">
                <LegBook row={quoteRow} t={t} />
              </div>
            ) : null}
          </div>
        ) : null}

        {/* P&L tool section */}
        <div className={SECTION_CLS}>
          <div className="text-[12px] font-semibold text-[var(--foreground)]">
            {t("payoffTool")}
          </div>
          {/* strategy chips */}
          <div className="mt-2 flex flex-wrap gap-1">
          {STRATEGY_IDS.map((id) => {
            const on = id === strategy;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setStrategy(id)}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] transition-colors ${
                  on
                    ? "bg-[var(--brand-soft)] font-medium text-[var(--brand-text)]"
                    : "text-[var(--muted)] hover:bg-[color-mix(in_srgb,var(--muted)_10%,transparent)] hover:text-[var(--foreground)]"
                }`}
              >
                <span aria-hidden className="text-[11px] leading-none opacity-80">
                  {strategyGlyph(id)}
                </span>
                {t(strategyLabelKey(id))}
              </button>
            );
          })}
        </div>

        {/* structure controls */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {strategy === "vertical"
            ? qt(
                verticalKind,
                (v) => setVerticalKind(v as "call" | "put"),
                [
                  { value: "call", label: t("callOpt") },
                  { value: "put", label: t("putOpt") },
                ],
                "vertical kind",
              )
            : null}
          {strategy === "vertical" ||
          strategy === "straddle" ||
          strategy === "strangle"
            ? qt(
                long ? "long" : "short",
                (v) => setLong(v === "long"),
                [
                  { value: "long", label: t("directionLong") },
                  { value: "short", label: t("directionShort") },
                ],
                "direction",
              )
            : null}
          {needsFar
            ? qt(
                farExpiry,
                (v) => setFarExpiry(v),
                expiries
                  .filter((d) => d !== expiry)
                  .map((d) => ({ value: d, label: d })),
                "far expiry",
              )
            : null}
          {needsFar && farQuery.isFetching ? (
            <span className="text-[11px] text-[var(--muted)]">
              {t("farLoading")}
            </span>
          ) : null}
        </div>

        <div className="mt-2.5">
          <StrategyLegsTable
            legs={pricedLegs}
            strikes={strikes}
            farStrikes={farStrikes}
            needsFar={needsFar}
            farExpiry={farExpiry}
            onChange={setLeg}
            t={t}
          />
        </div>

        {/* metrics */}
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.label}>
                <div className="text-[11px] text-[var(--muted)]">{m.label}</div>
                <div
                  className={`mt-0.5 truncate text-[13px] font-semibold tabular-nums ${m.tone}`}
                  title={m.value}
                >
                  {m.value}
                </div>
              </div>
            ))}
          </div>

        {/* payoff chart */}
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-[11px] text-[var(--muted)]">
              <span>{t("atExpiry")}</span>
              <span>
                {t("perContract")} · {t("spotLabel")}{" "}
                {formatNumber(spot, { maximumFractionDigits: 2 })}
              </span>
            </div>
            {eval_.prices.length ? (
              <PayoffChart
                prices={eval_.prices}
                combined={eval_.combined}
                perLeg={eval_.perLeg}
                spot={spot}
                breakevens={eval_.breakevens}
                strikeMarks={strikeMarks}
              />
            ) : null}
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">
              {t("pickFromChain")}
            </p>
          </div>
        </div>

        {/* calculator section */}
        <div className={SECTION_CLS}>
          <OptionCalculatorCard
            spot={spot}
            strike={quoteStrike}
            isCall={quoteKind === "call"}
            expiry={expiry}
            latestIv={quoteRow?.iv ?? null}
            t={t}
          />
        </div>
      </div>
    </SideDrawer>
  );
}
