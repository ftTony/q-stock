"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  StrategyLabResults,
  type BasketRow,
  type CompareLeg,
  type GridRow,
} from "@/components/strategy/strategy-lab-results";
import {
  LabBasketPanel,
  LabChip,
  LabComparePanel,
  LabGridPanel,
} from "@/components/strategy/strategy-lab-tools-panels";
import { SideDrawer } from "@/components/ui/side-drawer";
import { TopToast, type ToastTone } from "@/components/ui/top-toast";
import { useStrategiesList } from "@/hooks/query/use-strategies";
import {
  useLabReport,
  useRunStrategyBasket,
  useRunStrategyCompare,
  useRunStrategyParamGrid,
  useShareLabReport,
  useStrategyParamGrid,
  type LabTunable,
} from "@/hooks/query/use-strategy-lab";
import { replayErrorMessage } from "@/lib/strategy/replay-errors";

type StrategyOpt = { id: string; name: string };
type Quota = { used: number; limit: number };
type TabId = "compare" | "grid" | "basket";

function errPayload(err: unknown) {
  return err && typeof err === "object" && "payload" in err
    ? (err as { payload: Parameters<typeof replayErrorMessage>[0] }).payload
    : err instanceof Error
      ? { error: err.message }
      : {};
}

export function StrategyLabTools({
  strategyId,
  strategyName,
  symbol,
  assetType,
  rangeFrom,
  rangeTo,
  quota,
  onQuota,
  /** Compact trigger for embedding under the replay form. */
  compact = false,
}: {
  strategyId: string;
  strategyName?: string;
  symbol: string;
  assetType: string;
  rangeFrom: string;
  rangeTo: string;
  quota: Quota | null;
  onQuota?: (q: Quota) => void;
  compact?: boolean;
}) {
  const t = useTranslations("strategies");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabId>("compare");
  const [otherId, setOtherId] = useState("");
  const [paramId, setParamId] = useState("");
  const [selectedValues, setSelectedValues] = useState<number[]>([]);
  const [customValue, setCustomValue] = useState("");
  const [symbols, setSymbols] = useState<string[]>(["AAPL", "MSFT", "GOOGL"]);
  const [symbolDraft, setSymbolDraft] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<ToastTone>("neutral");
  const [toastKey, setToastKey] = useState(0);
  const [compare, setCompare] = useState<CompareLeg[] | null>(null);
  const [grid, setGrid] = useState<GridRow[] | null>(null);
  const [basket, setBasket] = useState<BasketRow[] | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);

  const strategiesQuery = useStrategiesList(locale, open);
  const paramGridQuery = useStrategyParamGrid(
    strategyId,
    open && tab === "grid",
  );
  const labReportQuery = useLabReport(reportId);
  const compareMut = useRunStrategyCompare();
  const gridMut = useRunStrategyParamGrid(strategyId);
  const basketMut = useRunStrategyBasket();
  const shareMut = useShareLabReport();

  const strategies = useMemo(() => {
    const data = strategiesQuery.data;
    if (!data) return [] as StrategyOpt[];
    return [...(data.templates ?? []), ...(data.strategies ?? [])]
      .map((s) => ({ id: s.id, name: s.name }))
      .filter((s) => s.id !== strategyId);
  }, [strategiesQuery.data, strategyId]);

  const params = (paramGridQuery.data?.params ?? []) as LabTunable[];

  useEffect(() => {
    if (!strategies.length) return;
    setOtherId((prev) => prev || strategies[0]!.id);
  }, [strategies]);

  useEffect(() => {
    if (!params.length) return;
    setParamId((prev) => {
      if (prev && params.some((p) => p.id === prev)) return prev;
      const first = params[0]!;
      setSelectedValues(first.presets.slice(0, 3));
      return first.id;
    });
  }, [params]);

  useEffect(() => {
    const report = labReportQuery.data?.report;
    if (!report) return;
    if (report.shareToken) setShareToken(report.shareToken);
    if (report.status !== "done" && report.status !== "failed") return;
    if (report.kind === "compare" && report.result?.legs) {
      setCompare(report.result.legs as CompareLeg[]);
    }
    if (report.kind === "param_grid" && report.result?.rows) {
      setGrid(report.result.rows as GridRow[]);
    }
    if (report.kind === "basket" && report.result?.rows) {
      setBasket(report.result.rows as BasketRow[]);
    }
    if (report.status === "failed") {
      setMsg(report.error || t("labFailed"));
    }
  }, [labReportQuery.data, t]);

  const busy =
    compareMut.isPending ||
    gridMut.isPending ||
    basketMut.isPending ||
    shareMut.isPending;

  const rangeBody = {
    symbol,
    assetType,
    rangeFrom: `${rangeFrom}T00:00:00.000Z`,
    rangeTo: `${rangeTo}T23:59:59.000Z`,
  };

  function clearResults() {
    setCompare(null);
    setGrid(null);
    setBasket(null);
    setShareToken(null);
    setMsg(null);
  }

  function showToast(message: string, tone: ToastTone = "neutral") {
    setToastTone(tone);
    setToastMsg(message);
    setToastKey((k) => k + 1);
  }

  async function shareReport() {
    if (!reportId) return;
    setMsg(null);
    try {
      const data = await shareMut.mutateAsync({
        reportId,
        revoke: Boolean(shareToken),
      });
      const token = data.report?.shareToken ?? null;
      setShareToken(token);
      if (token) {
        const prefix = locale === "en" ? "" : `${locale}/`;
        const url = `${window.location.origin}/${prefix}strategies/share/${token}`.replace(
          /([^:]\/)\/+/g,
          "$1",
        );
        try {
          await navigator.clipboard.writeText(url);
          showToast(t("shareCopied"), "success");
        } catch {
          showToast(url, "neutral");
        }
      } else {
        showToast(t("shareRevoked"), "neutral");
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t("shareFailed"),
        "error",
      );
    }
  }

  async function runCompare() {
    if (!otherId) return;
    clearResults();
    try {
      const data = await compareMut.mutateAsync({
        strategyIdA: strategyId,
        strategyIdB: otherId,
        ...rangeBody,
      });
      if (data.quota) onQuota?.(data.quota);
      setReportId(data.report?.id ?? null);
      if (data.report?.status === "done" && data.report.result?.legs) {
        setCompare(data.report.result.legs as CompareLeg[]);
      }
    } catch (err) {
      setMsg(replayErrorMessage(errPayload(err), t));
    }
  }

  async function runGrid() {
    const values = [...selectedValues]
      .filter((n) => Number.isFinite(n) && n > 0)
      .slice(0, 5);
    if (!paramId || values.length < 2) {
      setMsg(t("paramValuesHint"));
      return;
    }
    clearResults();
    try {
      const data = await gridMut.mutateAsync({
        paramId,
        values,
        ...rangeBody,
      });
      if (data.quota) onQuota?.(data.quota);
      setReportId(data.report?.id ?? null);
      if (data.report?.status === "done" && data.report.result?.rows) {
        setGrid(data.report.result.rows as GridRow[]);
      }
    } catch (err) {
      setMsg(replayErrorMessage(errPayload(err), t));
    }
  }

  async function runBasket() {
    const list = [...new Set(symbols.map((s) => s.toUpperCase()))].slice(0, 10);
    if (list.length < 2) {
      setMsg(t("basketHint"));
      return;
    }
    clearResults();
    try {
      const data = await basketMut.mutateAsync({
        strategyId,
        symbols: list,
        assetType,
        rangeFrom: rangeBody.rangeFrom,
        rangeTo: rangeBody.rangeTo,
      });
      if (data.quota) onQuota?.(data.quota);
      setReportId(data.report?.id ?? null);
      setMsg(t("basketQueued"));
    } catch (err) {
      setMsg(replayErrorMessage(errPayload(err), t));
    }
  }

  function toggleValue(n: number) {
    setSelectedValues((prev) => {
      if (prev.includes(n)) return prev.filter((x) => x !== n);
      if (prev.length >= 5) return prev;
      return [...prev, n].sort((a, b) => a - b);
    });
  }

  function addSymbol() {
    const s = symbolDraft.trim().toUpperCase();
    if (!s) return;
    setSymbols((prev) =>
      prev.includes(s) || prev.length >= 10 ? prev : [...prev, s],
    );
    setSymbolDraft("");
  }

  const otherName =
    strategies.find((s) => s.id === otherId)?.name ?? t("labPickStrategy");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          compact
            ? "flex w-full items-center justify-between rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-2)]/30 px-2.5 py-2 text-left transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]/40"
            : "flex w-full items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-left transition hover:border-[color-mix(in_srgb,var(--brand)_35%,var(--border))]"
        }
      >
        <div className="min-w-0">
          <p
            className={
              compact
                ? "text-[12px] font-medium text-[var(--foreground)]"
                : "text-[13px] font-medium text-[var(--foreground)]"
            }
          >
            {t("labTools")}
          </p>
          <p className="mt-0.5 truncate text-[10px] text-[var(--muted)]">
            {compact ? t("labToolsSubShort") : t("labToolsSub")}
          </p>
        </div>
        <span className="ml-2 shrink-0 text-[11px] tabular-nums text-[var(--brand-text)]">
          {t("labOpenDrawer")}
          {quota ? ` · ${quota.used}/${quota.limit}` : ""}
        </span>
      </button>

      <TopToast
        key={toastKey}
        message={toastMsg}
        tone={toastTone}
        onDismiss={() => setToastMsg(null)}
      />
      <SideDrawer
        open={open}
        onClose={() => setOpen(false)}
        title={t("labTools")}
        subtitle={`${symbol} · ${rangeFrom.slice(0, 10)} → ${rangeTo.slice(0, 10)}`}
        subtitleAside={
          quota ? (
            <span className="text-[11px] tabular-nums text-[var(--muted)]">
              {quota.used}/{quota.limit}
            </span>
          ) : null
        }
        widthClassName="w-full max-w-[min(100vw,28rem)] sm:max-w-[28rem]"
      >
        <div className="space-y-4 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["compare", t("labCompare")],
                ["grid", t("labParamGrid")],
                ["basket", t("labBasket")],
              ] as const
            ).map(([id, label]) => (
              <LabChip
                key={id}
                active={tab === id}
                onClick={() => setTab(id)}
              >
                {label}
              </LabChip>
            ))}
          </div>

          {tab === "compare" ? (
            <LabComparePanel
              strategyName={strategyName || ""}
              thisLabel={t("labThisStrategy")}
              leftLabel={t("labCompareLeft")}
              rightLabel={t("labCompareRight")}
              pickLabel={t("labComparePick")}
              emptyLabel={t("labNoOtherStrategies")}
              hint={t("labCompareHint")}
              runLabel={t("labRunCompare")}
              loadingLabel={t("loading")}
              otherId={otherId}
              otherName={otherName}
              strategies={strategies}
              busy={busy}
              onPick={setOtherId}
              onRun={() => void runCompare()}
            />
          ) : null}

          {tab === "grid" ? (
            <LabGridPanel
              params={params}
              paramId={paramId}
              selectedValues={selectedValues}
              customValue={customValue}
              pickParamLabel={t("labPickParam")}
              valuesLabel={t("labParamValues")}
              hint={t("labParamHint")}
              runLabel={t("labRunGrid")}
              loadingLabel={t("loading")}
              busy={busy}
              onPickParam={(id, presets) => {
                setParamId(id);
                setSelectedValues(presets);
              }}
              onToggleValue={toggleValue}
              onCustomChange={setCustomValue}
              onCustomCommit={() => {
                const n = Number(customValue);
                if (Number.isFinite(n) && n > 0) {
                  toggleValue(n);
                  setCustomValue("");
                }
              }}
              onRun={() => void runGrid()}
            />
          ) : null}

          {tab === "basket" ? (
            <LabBasketPanel
              symbols={symbols}
              draft={symbolDraft}
              symbolsLabel={t("labBasketSymbols")}
              addPlaceholder={t("labAddSymbol")}
              hint={t("labBasketHint")}
              runLabel={t("labRunBasket")}
              loadingLabel={t("loading")}
              busy={busy}
              onRemove={(s) =>
                setSymbols((prev) => prev.filter((x) => x !== s))
              }
              onDraftChange={setSymbolDraft}
              onAdd={addSymbol}
              onRun={() => void runBasket()}
            />
          ) : null}

          {msg ? (
            <p className="break-all text-[11px] text-[var(--muted)]">{msg}</p>
          ) : null}

          <StrategyLabResults
            compare={compare}
            grid={grid}
            basket={basket}
            reportId={reportId}
            shareToken={shareToken}
            busy={busy}
            onShare={() => void shareReport()}
          />
        </div>
      </SideDrawer>
    </>
  );
}
