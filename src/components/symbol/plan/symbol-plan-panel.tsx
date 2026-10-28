"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AuthLoginGate } from "@/components/auth/auth-login-gate";
import { EmptyReviewArt } from "@/components/symbol/shared/symbol-empty-art";
import { StrategyRulesSummary } from "@/components/strategy/strategy-rules-summary";
import { RailPanelSkeleton } from "@/components/ui/panel-skeleton";
import { SubmitButton } from "@/components/ui/submit-button";
import { QtSelect } from "@/components/ui/qt-select";
import {
  useCopyStrategyTemplate,
  useStartStrategyReplay,
  useStrategiesList,
  useStrategyDetail,
  useStrategyReplayDetail,
  useStrategyReplayList,
} from "@/hooks/query/use-strategies";
import { formatNumber } from "@/lib/format-number";
import type { AssetType } from "@/lib/types";
import {
  getBoundStrategyId,
  setBoundStrategyId,
} from "@/components/symbol/plan/symbol-plan-binding";
import { replayErrorMessage } from "@/lib/strategy/replay-errors";
import { ResearchCardPanel } from "@/components/research/research-card-panel";

type StrategyRow = {
  id: string;
  name: string;
  description: string | null;
  rules: unknown;
  isTemplate: boolean;
};

type ReplayResult = {
  totalReturnPct?: number;
  maxDrawdownPct?: number;
  tradeCount?: number;
  buyHoldReturnPct?: number;
  winRate?: number | null;
};

type ReplayRow = {
  id: string;
  status: string;
  symbol: string;
  assetType: string;
  result: ReplayResult | null;
  error: string | null;
  assumptions: unknown;
  rangeFrom: string;
  rangeTo: string;
};

function fmtPct(n: number | undefined | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${formatNumber(n, { maximumFractionDigits: 2 })}%`;
}

function defaultRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setUTCFullYear(from.getUTCFullYear() - 2);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

type Props = {
  symbol: string;
  assetType: AssetType;
  strategyId: string | null;
  onStrategyIdChange: (id: string | null, name?: string | null) => void;
  onGoOrder: () => void;
};

export function SymbolPlanPanel({
  symbol,
  assetType,
  strategyId,
  onStrategyIdChange,
  onGoOrder,
}: Props) {
  const t = useTranslations("symbolRail");
  const tSt = useTranslations("strategies");
  const locale = useLocale();
  const { data: session, status } = useSession();
  const [msg, setMsg] = useState<string | null>(null);
  const [matchedReplayId, setMatchedReplayId] = useState<string | null>(null);
  const range = useMemo(() => defaultRange(), []);

  const listQuery = useStrategiesList(locale);
  const detailQuery = useStrategyDetail(
    strategyId ?? "",
    locale,
    Boolean(strategyId),
  );
  const replaysQuery = useStrategyReplayList(
    strategyId ?? "",
    Boolean(strategyId),
  );
  const copyMut = useCopyStrategyTemplate(locale);
  const startReplayMut = useStartStrategyReplay(strategyId ?? "");

  const templates = (listQuery.data?.templates ?? []) as unknown as StrategyRow[];
  const mine = (listQuery.data?.strategies ?? []) as unknown as StrategyRow[];
  const active =
    (detailQuery.data?.strategy as unknown as StrategyRow | undefined) ?? null;
  const loading = listQuery.isLoading;
  const busy = copyMut.isPending || startReplayMut.isPending;

  useEffect(() => {
    const bound = getBoundStrategyId(assetType, symbol);
    if (bound && !strategyId) onStrategyIdChange(bound);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once per symbol
  }, [assetType, symbol]);

  useEffect(() => {
    if (!strategyId) {
      setMatchedReplayId(null);
      return;
    }
    if (active) onStrategyIdChange(active.id, active.name);
    const match = (replaysQuery.data?.replays as ReplayRow[] | undefined)?.find(
      (r) =>
        r.symbol.toUpperCase() === symbol.toUpperCase() &&
        r.assetType === assetType,
    );
    setMatchedReplayId(match?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategyId, symbol, assetType, active?.id, active?.name, replaysQuery.data]);

  const activeReplayQuery = useStrategyReplayDetail(
    strategyId ?? "",
    matchedReplayId,
    {
      enabled: Boolean(strategyId && matchedReplayId),
      refetchInterval: (q) => {
        const st = (q.state.data as { replay?: ReplayRow } | undefined)?.replay
          ?.status;
        if (!st || st === "done" || st === "failed") return false;
        return 2000;
      },
    },
  );

  const replay =
    (activeReplayQuery.data?.replay as ReplayRow | undefined) ??
    ((replaysQuery.data?.replays as ReplayRow[] | undefined)?.find(
      (r) => r.id === matchedReplayId,
    ) ??
      null);

  function bind(id: string | null, name?: string | null) {
    setBoundStrategyId(assetType, symbol, id);
    onStrategyIdChange(id, name ?? null);
    setMsg(null);
  }

  async function copyTemplate(templateId: string) {
    if (!session?.user) {
      setMsg(t("planLogin"));
      return;
    }
    setMsg(null);
    try {
      const data = await copyMut.mutateAsync(templateId);
      const s = data.strategy as StrategyRow | undefined;
      if (s) bind(s.id, s.name);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : tSt("copyFailed"));
    }
  }

  async function runReplay() {
    if (!session?.user) {
      setMsg(t("planLogin"));
      return;
    }
    if (!strategyId) return;
    setMsg(null);
    try {
      const data = await startReplayMut.mutateAsync({
        symbol,
        assetType,
        rangeFrom: `${range.from}T00:00:00.000Z`,
        rangeTo: `${range.to}T23:59:59.000Z`,
      });
      const next = data.replay as ReplayRow | undefined;
      if (next?.id) setMatchedReplayId(next.id);
    } catch (err) {
      setMsg(
        replayErrorMessage(
          { error: err instanceof Error ? err.message : undefined },
          tSt,
        ),
      );
    }
  }

  const selectOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [
      { value: "__none__", label: t("planUnbound") },
    ];
    for (const s of mine) {
      opts.push({ value: s.id, label: s.name });
    }
    return opts;
  }, [mine, t]);

  if (status === "loading" || loading) {
    return <RailPanelSkeleton rows={6} label={tSt("loading")} />;
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-[16rem] flex-1 flex-col items-center justify-center px-4 py-8">
        <AuthLoginGate
          compact
          title={t("planLogin")}
          body={t("planSubtitle")}
          hint=""
        />
      </div>
    );
  }

  const result = replay?.status === "done" ? replay.result : null;

  return (
    <div className="space-y-3 p-3">
      <p className="aw-caption">{t("planSubtitle")}</p>

      {msg ? (
        <p className="text-[12px] text-[var(--down)]">{msg}</p>
      ) : null}

      <div>
        <label className="aw-caption mb-1.5 block">{t("planBind")}</label>
        <QtSelect
          value={strategyId || "__none__"}
          onChange={(v) => {
            if (v === "__none__") {
              bind(null);
              setMatchedReplayId(null);
              return;
            }
            const row = mine.find((s) => s.id === v);
            bind(v, row?.name);
          }}
          options={selectOptions}
        />
      </div>

      {!strategyId ? (
        <div className="space-y-3 border-t border-[var(--aw-hairline,var(--border))] pt-3">
          <div className="flex flex-col items-center gap-2 py-2 text-center">
            <EmptyReviewArt />
            <p className="text-[13px] tracking-[-0.08px] text-[var(--muted)]">
              {t("planEmpty")}
            </p>
          </div>
          <ul className="divide-y divide-[var(--aw-hairline,var(--border))]">
            {templates.slice(0, 4).map((tpl) => (
              <li
                key={tpl.id}
                className="flex items-center justify-between gap-2 py-2"
              >
                <span className="min-w-0 truncate text-[13px] font-medium tracking-[-0.08px]">
                  {tpl.name}
                </span>
                <SubmitButton
                  type="button"
                  loading={busy}
                  loadingLabel="…"
                  onClick={() => void copyTemplate(tpl.id)}
                  className="!h-7 shrink-0 !rounded-none !border-0 !bg-[var(--brand)] !px-2.5 !py-0 !text-[12px] !font-normal !leading-none !text-white"
                >
                  {t("planUseTemplate")}
                </SubmitButton>
              </li>
            ))}
          </ul>
          <Link href="/strategies" className="aw-text-link text-[12px]">
            {t("planOpenLab")}
          </Link>
        </div>
      ) : null}

      {active ? (
        <div className="space-y-3 border-t border-[var(--border)] pt-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="aw-caption-strong text-[13px]">{active.name}</p>
              {active.description ? (
                <p className="aw-caption mt-0.5 line-clamp-2">
                  {active.description}
                </p>
              ) : null}
            </div>
            <Link
              href={`/strategies/${active.id}`}
              className="aw-text-link shrink-0 text-[12px]"
            >
              {t("planEdit")}
            </Link>
          </div>

          <StrategyRulesSummary rules={active.rules} />

          <div className="space-y-2 border-t border-[var(--border)] pt-3">
            <p className="aw-caption-strong text-[13px]">{t("planReplay")}</p>
            <p className="aw-caption tabular-nums">
              {range.from} → {range.to}
            </p>

            <div className="flex items-stretch gap-2">
              <SubmitButton
                type="button"
                loading={busy}
                loadingLabel={tSt("loading")}
                onClick={() => void runReplay()}
                className="aw-btn-pill-ghost min-w-0 flex-1 !h-9 !px-3 !text-[13px]"
              >
                {t("planRunReplay")}
              </SubmitButton>
              <button
                type="button"
                onClick={onGoOrder}
                data-tour="rail-order"
                className="aw-btn-pill min-w-0 flex-1 !h-9 !px-3 !text-[13px]"
              >
                {t("planGoOrder")}
              </button>
            </div>

            {replay &&
            (replay.status === "pending" || replay.status === "running") ? (
              <p className="aw-caption">
                {tSt("replayRunning")} · {replay.status}
              </p>
            ) : null}
            {replay?.status === "failed" ? (
              <p className="text-[12px] text-[var(--down)]">
                {replay.error || tSt("replayFailed")}
              </p>
            ) : null}

            {result ? (
              <div className="space-y-1.5 border-t border-[var(--aw-hairline,var(--border))] pt-2">
                <div className="flex justify-between gap-2 text-[13px]">
                  <span className="aw-caption">{tSt("maxDd")}</span>
                  <span className="tabular-nums font-medium">
                    {fmtPct(result.maxDrawdownPct)}
                  </span>
                </div>
                <div className="flex justify-between gap-2 text-[13px]">
                  <span className="aw-caption">{tSt("trades")}</span>
                  <span className="tabular-nums">
                    {result.tradeCount ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-2 text-[13px]">
                  <span className="aw-caption">{tSt("return")}</span>
                  <span className="tabular-nums">
                    {fmtPct(result.totalReturnPct)}
                  </span>
                </div>
                <div className="flex justify-between gap-2 text-[13px]">
                  <span className="aw-caption">{tSt("buyHold")}</span>
                  <span className="tabular-nums">
                    {fmtPct(result.buyHoldReturnPct)}
                  </span>
                </div>
                <p className="aw-caption border-t border-[var(--aw-hairline,var(--border))] pt-1.5 leading-snug">
                  {t("planReplayFootnote")}
                </p>
                <Link
                  href={
                    replay?.id
                      ? `/strategies/${active.id}?replayId=${replay.id}`
                      : `/strategies/${active.id}`
                  }
                  className="aw-text-link text-[12px]"
                >
                  {t("planFullReport")}
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <ResearchCardPanel symbol={symbol} assetType={assetType} />
    </div>
  );
}
