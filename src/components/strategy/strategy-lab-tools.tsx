"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";
import { QtSelect } from "@/components/ui/qt-select";
import {
  StrategyLabResults,
  type BasketRow,
  type CompareLeg,
  type GridRow,
} from "@/components/strategy/strategy-lab-results";
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

export function StrategyLabTools({
  strategyId,
  symbol,
  assetType,
  rangeFrom,
  rangeTo,
  quota,
  onQuota,
}: {
  strategyId: string;
  symbol: string;
  assetType: string;
  rangeFrom: string;
  rangeTo: string;
  quota: Quota | null;
  onQuota?: (q: Quota) => void;
}) {
  const t = useTranslations("strategies");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"compare" | "grid" | "basket">("compare");
  const [otherId, setOtherId] = useState("");
  const [paramId, setParamId] = useState("");
  const [valuesText, setValuesText] = useState("10,20,60");
  const [basketText, setBasketText] = useState("AAPL,MSFT,GOOGL");
  const [msg, setMsg] = useState<string | null>(null);
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
      setValuesText(first.presets.join(","));
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
          setMsg(t("shareCopied"));
        } catch {
          setMsg(url);
        }
      } else {
        setMsg(t("shareRevoked"));
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : t("shareFailed"));
    }
  }

  const rangeBody = {
    symbol,
    assetType,
    rangeFrom: `${rangeFrom}T00:00:00.000Z`,
    rangeTo: `${rangeTo}T23:59:59.000Z`,
  };

  async function runCompare(e: FormEvent) {
    e.preventDefault();
    if (!otherId) return;
    setMsg(null);
    setCompare(null);
    setGrid(null);
    setBasket(null);
    setShareToken(null);
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
      const payload =
        err && typeof err === "object" && "payload" in err
          ? (err as { payload: Parameters<typeof replayErrorMessage>[0] })
              .payload
          : err instanceof Error
            ? { error: err.message }
            : {};
      setMsg(replayErrorMessage(payload, t));
    }
  }

  async function runGrid(e: FormEvent) {
    e.preventDefault();
    const values = valuesText
      .split(/[,，\s]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0)
      .slice(0, 5);
    if (!paramId || values.length < 2) {
      setMsg(t("paramValuesHint"));
      return;
    }
    setMsg(null);
    setGrid(null);
    setCompare(null);
    setBasket(null);
    setShareToken(null);
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
      const payload =
        err && typeof err === "object" && "payload" in err
          ? (err as { payload: Parameters<typeof replayErrorMessage>[0] })
              .payload
          : err instanceof Error
            ? { error: err.message }
            : {};
      setMsg(replayErrorMessage(payload, t));
    }
  }

  async function runBasket(e: FormEvent) {
    e.preventDefault();
    const symbols = [
      ...new Set(
        basketText
          .split(/[,，\s]+/)
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean),
      ),
    ].slice(0, 10);
    if (symbols.length < 2) {
      setMsg(t("basketHint"));
      return;
    }
    setMsg(null);
    setBasket(null);
    setCompare(null);
    setGrid(null);
    setShareToken(null);
    try {
      const data = await basketMut.mutateAsync({
        strategyId,
        symbols,
        assetType,
        rangeFrom: rangeBody.rangeFrom,
        rangeTo: rangeBody.rangeTo,
      });
      if (data.quota) onQuota?.(data.quota);
      setReportId(data.report?.id ?? null);
      setMsg(t("basketQueued"));
    } catch (err) {
      const payload =
        err && typeof err === "object" && "payload" in err
          ? (err as { payload: Parameters<typeof replayErrorMessage>[0] })
              .payload
          : err instanceof Error
            ? { error: err.message }
            : {};
      setMsg(replayErrorMessage(payload, t));
    }
  }

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <h2 className="text-[13px] font-medium">{t("labTools")}</h2>
        <span className="text-[11px] text-[var(--muted)]">
          {open ? t("labCollapse") : t("labExpand")}
          {quota ? ` · ${quota.used}/${quota.limit}` : ""}
        </span>
      </button>

      {open ? (
        <div className="mt-3 space-y-3 border-t border-[var(--border)] pt-3">
          <div className="flex flex-wrap gap-1">
            {(
              [
                ["compare", t("labCompare")],
                ["grid", t("labParamGrid")],
                ["basket", t("labBasket")],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`rounded px-2 py-1 text-[11px] ${
                  tab === id
                    ? "bg-[var(--brand-soft)] text-[var(--brand-text)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-2)]"
                }`}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "compare" ? (
            <form onSubmit={(e) => void runCompare(e)} className="space-y-2">
              <p className="text-[11px] text-[var(--muted)]">
                {t("labCompareHint")}
              </p>
              <QtSelect
                value={otherId}
                onChange={setOtherId}
                options={
                  strategies.length > 0
                    ? strategies.map((s) => ({
                        value: s.id,
                        label: s.name,
                      }))
                    : [{ value: "", label: t("labPickStrategy") }]
                }
                aria-label={t("labPickStrategy")}
              />
              <SubmitButton
                type="submit"
                loading={busy}
                loadingLabel={t("loading")}
                className="qt-btn qt-btn-primary h-8 w-full text-xs"
              >
                {t("labRunCompare")}
              </SubmitButton>
            </form>
          ) : null}

          {tab === "grid" ? (
            <form onSubmit={(e) => void runGrid(e)} className="space-y-2">
              <p className="text-[11px] text-[var(--muted)]">
                {t("labParamHint")}
              </p>
              <QtSelect
                value={paramId}
                onChange={(id) => {
                  setParamId(id);
                  const p = params.find((x) => x.id === id);
                  if (p) setValuesText(p.presets.join(","));
                }}
                options={
                  params.length > 0
                    ? params.map((p) => ({
                        value: p.id,
                        label: p.label,
                      }))
                    : [{ value: "", label: t("labPickParam") }]
                }
                aria-label={t("labPickParam")}
              />
              <input
                className="qt-input h-8 w-full px-2 text-[12px]"
                value={valuesText}
                onChange={(e) => setValuesText(e.target.value)}
                placeholder="10,20,60"
              />
              <SubmitButton
                type="submit"
                loading={busy}
                loadingLabel={t("loading")}
                className="qt-btn qt-btn-primary h-8 w-full text-xs"
              >
                {t("labRunGrid")}
              </SubmitButton>
            </form>
          ) : null}

          {tab === "basket" ? (
            <form onSubmit={(e) => void runBasket(e)} className="space-y-2">
              <p className="text-[11px] text-[var(--muted)]">
                {t("labBasketHint")}
              </p>
              <textarea
                className="qt-input w-full px-2 py-1.5 text-[12px]"
                rows={2}
                value={basketText}
                onChange={(e) => setBasketText(e.target.value)}
              />
              <SubmitButton
                type="submit"
                loading={busy}
                loadingLabel={t("loading")}
                className="qt-btn qt-btn-primary h-8 w-full text-xs"
              >
                {t("labRunBasket")}
              </SubmitButton>
            </form>
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
      ) : null}
    </section>
  );
}
