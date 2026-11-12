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
  buildExpiryScenarios,
  buildLegs,
  DUAL_EXPIRY_STRATEGIES,
  earliestOptionExpiry,
  evaluateStrategy,
  premiumFromChain,
  quoteFromChain,
  STRATEGY_IDS,
  strategyGlyph,
  strategyLabelKey,
} from "./option-strategy-utils";
import type { PricedLeg, StrategyId, StrategyLeg } from "./option-strategy-utils";
import { ContractQuote } from "./drawer/contract-quote";
import { ExpiryScenarioCard } from "./drawer/expiry-scenario-card";
import { LegBook } from "./drawer/leg-book";
import { OptionCalculatorCard } from "./drawer/option-calculator-card";
import { PayoffChart } from "./drawer/payoff-chart";
import { ProbabilityAnalysisCard } from "./drawer/probability-analysis-card";
import { StrategyLegsTable } from "./drawer/strategy-legs-table";
import { StrategyMetricsStrip } from "./drawer/strategy-metrics-strip";
import {
  CHIP_CLS,
  CHIP_OFF,
  CHIP_ON,
  DEFAULT_RATE_PCT,
  QT_TRIGGER,
  SECTION_CLS,
} from "./drawer/drawer-ui";

export type StrategySeed = { kind: "call" | "put"; strike: number } | null;

export type OptionStrategyDrawerProps = {
  open: boolean;
  onClose: () => void;
  symbol: string;
  assetType: AssetType;
  spot: number;
  expiry: string;
  expiries: string[];
  rows: StrikeRow[];
  seed: StrategySeed;
};

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
 * Drawer body only — parent owns SideDrawer so the shell can open before this
 * chunk finishes loading.
 */
export function OptionStrategyDrawerBody({
  open,
  symbol,
  assetType,
  spot,
  expiry,
  expiries,
  rows,
  seed,
}: Omit<OptionStrategyDrawerProps, "onClose">) {
  const t = useTranslations("symbol.optTool");
  const [strategy, setStrategy] = useState<StrategyId>("single");
  const [long, setLong] = useState(true);
  const [verticalKind, setVerticalKind] = useState<"call" | "put">("call");
  const [legs, setLegs] = useState<StrategyLeg[]>([]);
  const [quoteKind, setQuoteKind] = useState<"call" | "put">(
    seed?.kind ?? "call",
  );
  const [quoteStrike, setQuoteStrike] = useState<number>(seed?.strike ?? 0);

  const needsFar = DUAL_EXPIRY_STRATEGIES.includes(strategy);
  const farDefault = useMemo(() => {
    const idx = expiries.indexOf(expiry);
    return expiries[idx + 1] ?? expiries[idx - 1] ?? expiry;
  }, [expiries, expiry]);
  const [farExpiry, setFarExpiry] = useState(farDefault);
  useEffect(() => setFarExpiry(farDefault), [farDefault]);

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

  const farQuery = useQuery({
    // Same key shape as useMarketOptionsChain — no live spot (avoids refetch thrash).
    queryKey: ["market", "options", assetType, symbol, farExpiry] as const,
    enabled: open && needsFar && Boolean(farExpiry),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
    queryFn: () => {
      const qs = new URLSearchParams({
        symbol,
        assetType,
        expiry: farExpiry,
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
        if (l.kind === "stock") return { ...l, premium: null, iv: null };
        const src = l.expiry === farExpiry && needsFar ? farRows : rows;
        const q = quoteFromChain(src, l.kind, l.strike ?? 0);
        return { ...l, premium: q.premium, iv: q.iv };
      }),
    [legs, rows, farRows, farExpiry, needsFar],
  );

  const horizonYmd = useMemo(
    () => earliestOptionExpiry(pricedLegs) ?? expiry,
    [pricedLegs, expiry],
  );

  const fallbackIvPct = useMemo(() => {
    const hit = pricedLegs.find((l) => l.iv != null && l.iv > 0)?.iv;
    return hit != null && hit > 0 ? hit : 30;
  }, [pricedLegs]);

  const eval_ = useMemo(
    () =>
      evaluateStrategy(pricedLegs, spot, spot, {
        horizonYmd,
        fallbackIvPct,
      }),
    [pricedLegs, spot, horizonYmd, fallbackIvPct],
  );

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

  useEffect(() => {
    if (!open) return;
    if (seed) {
      setQuoteKind(seed.kind);
      setQuoteStrike(seed.strike);
    } else if (strikes.length && !quoteStrike) {
      setQuoteStrike(
        strikes.reduce((a, b) =>
          Math.abs(b - spot) < Math.abs(a - spot) ? b : a,
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, seed]);

  const quoteRow = quoteStrike
    ? optionFor(rows, quoteKind, quoteStrike)
    : undefined;
  const quotePremium = quoteStrike
    ? premiumFromChain(rows, quoteKind, quoteStrike)
    : null;
  const scenarioIv = quoteRow?.iv ?? null;
  const scenarios = useMemo(
    () =>
      buildExpiryScenarios({
        spot,
        ivPct: scenarioIv != null && scenarioIv > 0 ? scenarioIv : fallbackIvPct,
        daysToExpiry: daysToExpiry(horizonYmd),
        ratePct: DEFAULT_RATE_PCT,
        legs: pricedLegs,
        horizonYmd,
      }),
    [spot, scenarioIv, fallbackIvPct, horizonYmd, pricedLegs],
  );
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
      <div className="flex flex-col gap-0 px-4 py-3 text-[12px]">
        {/* 1. Quote — selectors + hero; detail collapses */}
        {quoteStrike ? (
          <div className="pb-1">
            <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
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
              book={
                quoteRow ? <LegBook row={quoteRow} t={t} /> : null
              }
            />
          </div>
        ) : null}

        {/* 2. Strategy structure */}
        <div className={SECTION_CLS}>
          <div className="mb-2 text-[12px] font-medium text-[var(--foreground)]">
            {t("payoffTool")}
          </div>
          <div className="flex flex-wrap gap-1">
            {STRATEGY_IDS.map((id) => {
              const on = id === strategy;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setStrategy(id)}
                  className={`${CHIP_CLS} ${on ? CHIP_ON : CHIP_OFF}`}
                >
                  <span
                    aria-hidden
                    className="inline-flex w-[1em] shrink-0 items-center justify-center text-[13px] font-semibold leading-none"
                  >
                    {strategyGlyph(id)}
                  </span>
                  {t(strategyLabelKey(id))}
                </button>
              );
            })}
          </div>

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

          <StrategyMetricsStrip eval_={eval_} t={t} />
        </div>

        {/* 3. Payoff chart */}
        <div className={SECTION_CLS}>
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <span className="text-[12px] font-medium text-[var(--foreground)]">
              {needsFar ? t("atNearExpiry") : t("atExpiry")}
            </span>
            <span className="text-[11px] tabular-nums text-[var(--muted)]">
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
          <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--muted)]">
            {needsFar ? t("nearExpiryHint") : t("pickFromChain")}
          </p>
        </div>

        {/* 4. Risk summary + expiry ±σ scenarios */}
        <div className={SECTION_CLS}>
          <ExpiryScenarioCard
            symbol={symbol}
            assetType={assetType}
            maxLoss={eval_.maxLoss}
            maxProfit={eval_.maxProfit}
            breakevens={eval_.breakevens}
            netPremium={eval_.netPremium}
            scenarios={scenarios}
            ivPct={scenarioIv}
          />
        </div>

        {/* 5. Probability cone (IV → expected path band) */}
        <div className={SECTION_CLS}>
          <ProbabilityAnalysisCard
            spot={spot}
            ivPct={quoteRow?.iv ?? null}
            daysToExpiry={daysToExpiry(expiry)}
            ratePct={DEFAULT_RATE_PCT}
            strikeMarks={strikeMarks}
          />
        </div>

        {/* 6. Calculator — always visible */}
        <div className={SECTION_CLS}>
          <div className="mb-2 text-[12px] font-medium text-[var(--foreground)]">
            {t("calcTitle")}
          </div>
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
  );
}

/** Full drawer: shell + body (body can also be loaded separately for instant open). */
export function OptionStrategyDrawer(props: OptionStrategyDrawerProps) {
  const t = useTranslations("symbol.optTool");
  return (
    <SideDrawer
      open={props.open}
      onClose={props.onClose}
      title={t("title")}
      subtitle={`${props.symbol} · ${props.expiry}`}
      className="aw !bg-[var(--panel)]"
    >
      <OptionStrategyDrawerBody {...props} />
    </SideDrawer>
  );
}
