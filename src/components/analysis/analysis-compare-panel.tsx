"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AiLoginGate } from "@/components/ai/ai-login-gate";
import { AiQuotaBadge } from "@/components/ai/ai-quota-badge";
import { useAiAccess } from "@/components/ai/use-ai-access";
import { ChangePct, PriceText } from "@/components/market/price";
import { SubmitButton } from "@/components/ui/submit-button";
import { TopToast } from "@/components/ui/top-toast";
import { Sparkline } from "@/components/market/sparkline";
import { AnalysisCompareMetrics } from "@/components/analysis/analysis-compare-metrics";
import {
  ANALYSIS_BASKET_MAX,
  ANALYSIS_BASKET_MIN,
  basketKey,
  type AnalysisBasketItem,
} from "@/components/analysis/types";
import {
  currencyPrefix,
  formatCompact,
  formatMoney,
  loadBasketFundamentals,
  type FundMetrics,
} from "@/components/analysis/compare-fundamentals";
import { displayName } from "@/lib/market-names";

type CompareResult = {
  overview: string;
  dimensions: Array<{ name: string; ranking: string[]; note: string }>;
  calmTakeaway: string;
  risks: string[];
  disclaimer: string;
  degraded?: boolean;
  cached?: boolean;
  error?: string;
};

type Props = {
  basket: AnalysisBasketItem[];
  industryName?: string;
  onBack: () => void;
  onRemove: (symbol: string, assetType: AnalysisBasketItem["assetType"]) => void;
};

export function AnalysisComparePanel({
  basket,
  industryName,
  onBack,
  onRemove,
}: Props) {
  const t = useTranslations("analysis");
  const tAi = useTranslations("ai");
  const tCommon = useTranslations("common");
  const tSymbol = useTranslations("symbol");
  const locale = useLocale();
  const access = useAiAccess();
  const [ai, setAi] = useState<CompareResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [funds, setFunds] = useState<Record<string, FundMetrics>>({});
  const [fundsLoading, setFundsLoading] = useState(false);
  const [quotaTick, setQuotaTick] = useState(0);

  const canRun = basket.length >= ANALYSIS_BASKET_MIN;
  const canAddMore = basket.length < ANALYSIS_BASKET_MAX;

  useEffect(() => {
    setAi(null);
    setAiError(null);
  }, [basket]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (basket.length === 0) {
        setFunds({});
        return;
      }
      setFundsLoading(true);
      const next = await loadBasketFundamentals(basket);
      if (cancelled) return;
      setFunds(next);
      setFundsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [basket]);

  async function runAiCompare() {
    if (!canRun || !access.loggedIn) return;
    if (!(await access.ensureQuota())) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: basket.map((b) => ({
            symbol: b.symbol,
            assetType: b.assetType,
          })),
          locale,
        }),
      });
      const data = (await res.json()) as CompareResult;
      if (!res.ok) {
        if (access.handleAiHttpError(res.status)) {
          setAi(null);
          setQuotaTick((n) => n + 1);
          return;
        }
        setAiError(data.error || tAi("unavailable"));
        setAi(null);
        return;
      }
      setAi(data);
      setQuotaTick((n) => n + 1);
    } catch {
      setAiError(tCommon("error"));
      setAi(null);
    } finally {
      setAiLoading(false);
    }
  }

  const backBtn = (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--brand-text)]"
    >
      <svg
        className="h-3.5 w-3.5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {tSymbol("back")}
    </button>
  );

  if (basket.length === 0) {
    return (
      <div className="space-y-3">
        {backBtn}
        <div className="qt-panel px-4 py-10 text-center text-[14px] text-[var(--muted)]">
          {t("basketHint")}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <header className="flex flex-wrap items-center gap-x-2 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          {backBtn}
          <span
            className="hidden h-3.5 w-px shrink-0 bg-[var(--border)] sm:block"
            aria-hidden
          />
          <h2 className="text-sm font-semibold tracking-tight">
            {t("workspaceCompare")}
          </h2>
          {industryName && (
            <span className="text-[11px] font-normal text-[var(--muted)]">
              {industryName}
            </span>
          )}
          <span className="text-xs tabular-nums text-[var(--muted)]">
            {t("basketCount", {
              count: basket.length,
              max: ANALYSIS_BASKET_MAX,
            })}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {canAddMore && (
            <button
              type="button"
              className="qt-btn qt-btn-ghost h-7 px-2.5 text-xs"
              onClick={onBack}
            >
              {t("addMore")}
            </button>
          )}
        </div>
      </header>

      <div
        className={`grid gap-3 ${
          basket.length <= 2
            ? "sm:grid-cols-2"
            : basket.length === 3
              ? "sm:grid-cols-3"
              : "sm:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {basket.map((b) => {
          const up = (b.percentChange ?? 0) >= 0;
          const f = funds[basketKey(b)];
          return (
            <article
              key={`${b.assetType}:${b.symbol}`}
              className="qt-panel flex flex-col gap-2.5 p-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/symbol/${b.assetType}/${b.symbol}`}
                    className="text-[14px] font-semibold tracking-wide hover:text-[var(--brand-text)]"
                  >
                    {b.symbol}
                  </Link>
                  <div className="truncate text-[12px] text-[var(--muted)]">
                    {b.name || displayName(b.symbol, b.assetType)}
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded px-1.5 text-[14px] leading-none text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                  aria-label={t("removeFromCompare")}
                  onClick={() => onRemove(b.symbol, b.assetType)}
                >
                  ×
                </button>
              </div>

              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-[14px] font-semibold tabular-nums">
                  {b.price != null ? (
                    <>
                      <span className="font-normal text-[var(--muted)]">
                        {currencyPrefix(b.assetType)}
                      </span>
                      <PriceText
                        value={b.price}
                        change={b.percentChange ?? 0}
                      />
                    </>
                  ) : (
                    "—"
                  )}
                </span>
                <span className="text-[14px] font-medium">
                  {b.percentChange != null ? (
                    <ChangePct value={b.percentChange} />
                  ) : (
                    "—"
                  )}
                </span>
              </div>

              {b.high != null &&
                b.low != null &&
                b.price != null &&
                b.high !== b.low && (
                  <Sparkline
                    open={b.previousClose ?? b.low}
                    high={b.high}
                    low={b.low}
                    close={b.price}
                    up={up}
                  />
                )}

              <dl className="grid grid-cols-3 gap-2 border-t border-[var(--border)] pt-2.5 text-[14px]">
                <div>
                  <dt className="text-[12px] text-[var(--muted)]">{t("high")}</dt>
                  <dd className="mt-0.5 font-medium tabular-nums">
                    {formatMoney(b.high, b.assetType)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[12px] text-[var(--muted)]">{t("low")}</dt>
                  <dd className="mt-0.5 font-medium tabular-nums">
                    {formatMoney(b.low, b.assetType)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[12px] text-[var(--muted)]">
                    {t("metricMktCap")}
                  </dt>
                  <dd className="mt-0.5 font-medium tabular-nums">
                    {fundsLoading && !f
                      ? "…"
                      : formatCompact(
                          f?.marketCap,
                          currencyPrefix(b.assetType),
                        )}
                  </dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>

      <AnalysisCompareMetrics
        basket={basket}
        funds={funds}
        fundsLoading={fundsLoading}
      />

      <section className="qt-panel p-4">
        <TopToast
          key={access.toastKey}
          message={access.toastMsg}
          tone={access.toastTone}
          onDismiss={access.dismissToast}
        />
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <h3 className="text-[14px] font-semibold">{t("aiCompare")}</h3>
            <AiQuotaBadge refreshKey={quotaTick} />
          </div>
          {ai && access.loggedIn && (
            <SubmitButton
              type="button"
              className="qt-btn-ghost h-9 px-3"
              disabled={!canRun}
              loading={aiLoading}
              showElapsed={(s) => tAi("elapsed", { seconds: s })}
              onClick={() => void runAiCompare()}
            >
              {t("aiCompareAgain")}
            </SubmitButton>
          )}
        </div>

        {!canRun && (
          <p className="text-[14px] text-[var(--muted)]">{t("basketHint")}</p>
        )}
        {aiError && (
          <p className="text-[14px] text-[var(--down)]">{aiError}</p>
        )}

        {!ai && !aiError && canRun && !access.loggedIn && (
          <AiLoginGate className="min-h-[14rem] py-6" />
        )}

        {!ai && !aiError && canRun && access.loggedIn && (
          <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-2)]/50 px-4 py-6 text-center">
            <p className="text-[14px] text-[var(--muted)]">
              {t("aiCompareHint")}
            </p>
            <SubmitButton
              type="button"
              className="qt-btn-primary mt-3 h-9 px-4"
              loading={aiLoading}
              showElapsed={(s) => tAi("elapsed", { seconds: s })}
              onClick={() => void runAiCompare()}
            >
              {t("aiCompareRun")}
            </SubmitButton>
          </div>
        )}

        {ai && (
          <div className="space-y-4 text-[14px] leading-relaxed">
            {ai.cached && (
              <p className="text-[12px] text-[var(--muted)]">{tAi("cached")}</p>
            )}
            <section>
              <h4 className="mb-1.5 text-[12px] font-semibold tracking-wide text-[var(--muted)] uppercase">
                {t("aiOverview")}
              </h4>
              <p>{ai.overview}</p>
            </section>
            <section className="space-y-2">
              <h4 className="text-[12px] font-semibold tracking-wide text-[var(--muted)] uppercase">
                {t("aiDimensions")}
              </h4>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {ai.dimensions.map((d) => (
                  <div
                    key={d.name}
                    className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5"
                  >
                    <div className="font-semibold">{d.name}</div>
                    <div className="mt-0.5 text-[var(--brand-text)]">
                      {d.ranking.join(" → ")}
                    </div>
                    <p className="mt-1 text-[12px] text-[var(--muted)]">
                      {d.note}
                    </p>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h4 className="mb-1.5 text-[12px] font-semibold tracking-wide text-[var(--muted)] uppercase">
                {t("aiTakeaway")}
              </h4>
              <p>{ai.calmTakeaway}</p>
            </section>
            <section>
              <h4 className="mb-1.5 text-[12px] font-semibold tracking-wide text-[var(--muted)] uppercase">
                {t("aiRisks")}
              </h4>
              <ul className="list-disc space-y-1 pl-5 text-[var(--muted)]">
                {ai.risks.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>
            <p className="text-[12px] text-[var(--muted)]">
              {ai.disclaimer || tAi("disclaimer")}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
