"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AuthLoginGate } from "@/components/auth/auth-login-gate";
import { StrategyRulesSummary } from "@/components/strategy/strategy-rules-summary";
import { SubmitButton } from "@/components/ui/submit-button";
import { QtSelect } from "@/components/ui/qt-select";
import { formatNumber } from "@/lib/format-number";
import type { AssetType } from "@/lib/types";
import {
  getBoundStrategyId,
  setBoundStrategyId,
} from "@/components/symbol/symbol-plan-binding";

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
  const { data: session, status } = useSession();
  const [templates, setTemplates] = useState<StrategyRow[]>([]);
  const [mine, setMine] = useState<StrategyRow[]>([]);
  const [active, setActive] = useState<StrategyRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [replay, setReplay] = useState<ReplayRow | null>(null);
  const range = useMemo(() => defaultRange(), []);

  const loadLists = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/strategies");
      if (!res.ok) return;
      const data = await res.json();
      setTemplates(data.templates ?? []);
      setMine(data.strategies ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLists();
  }, [loadLists]);

  useEffect(() => {
    const bound = getBoundStrategyId(assetType, symbol);
    if (bound && !strategyId) onStrategyIdChange(bound);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once per symbol
  }, [assetType, symbol]);

  useEffect(() => {
    if (!strategyId) {
      setActive(null);
      setReplay(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      const res = await fetch(`/api/strategies/${strategyId}`);
      if (!res.ok || cancelled) return;
      const data = await res.json();
      const s = data.strategy as StrategyRow | undefined;
      if (!s) return;
      setActive(s);
      // Sync display name to quote bar without rewriting binding id.
      onStrategyIdChange(s.id, s.name);
      const rr = await fetch(`/api/strategies/${strategyId}/replay`);
      if (!rr.ok || cancelled) return;
      const rj = await rr.json();
      const match = (rj.replays as ReplayRow[] | undefined)?.find(
        (r) =>
          r.symbol.toUpperCase() === symbol.toUpperCase() &&
          r.assetType === assetType,
      );
      if (match) setReplay(match);
      else setReplay(null);
    })();
    return () => {
      cancelled = true;
    };
    // intentionally omit onStrategyIdChange — stable from parent useCallback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategyId, symbol, assetType]);

  useEffect(() => {
    if (!replay || !strategyId) return;
    if (replay.status !== "pending" && replay.status !== "running") return;
    const id = window.setInterval(() => {
      void (async () => {
        const res = await fetch(
          `/api/strategies/${strategyId}/replay?replayId=${replay.id}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.replay) setReplay(data.replay);
      })();
    }, 2000);
    return () => window.clearInterval(id);
  }, [replay, strategyId]);

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
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/strategies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromTemplateId: templateId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || tSt("copyFailed"));
        return;
      }
      const s = data.strategy as StrategyRow;
      await loadLists();
      bind(s.id, s.name);
    } finally {
      setBusy(false);
    }
  }

  async function runReplay() {
    if (!session?.user) {
      setMsg(t("planLogin"));
      return;
    }
    if (!strategyId) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/strategies/${strategyId}/replay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          assetType,
          rangeFrom: `${range.from}T00:00:00.000Z`,
          rangeTo: `${range.to}T23:59:59.000Z`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || tSt("replayFailed"));
        return;
      }
      setReplay(data.replay);
    } finally {
      setBusy(false);
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
    return (
      <div className="p-3 text-[12px] text-[var(--muted)]">{tSt("loading")}</div>
    );
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
              setActive(null);
              setReplay(null);
              return;
            }
            const row = mine.find((s) => s.id === v);
            bind(v, row?.name);
          }}
          options={selectOptions}
        />
      </div>

      {!strategyId ? (
        <div className="space-y-2 border-t border-[var(--border)] pt-3">
          <p className="text-[12px] text-[var(--muted)]">{t("planEmpty")}</p>
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
                  className="!h-7 shrink-0 !rounded-full !border-0 !bg-[var(--brand)] !px-2.5 !py-0 !text-[12px] !font-normal !leading-none !text-white"
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
              <p className="aw-caption-strong text-[13px]">
                {active.name}
              </p>
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
                className="min-w-0 flex-1 !h-9 !rounded-full !border !border-[var(--border)] !bg-[var(--panel)] !px-3 !py-0 !text-[13px] !font-normal !text-[var(--foreground)]"
              >
                {t("planRunReplay")}
              </SubmitButton>
              <button
                type="button"
                onClick={onGoOrder}
                className="aw-btn-pill min-w-0 flex-1 !h-9 !px-3 !text-[13px]"
              >
                {t("planGoOrder")}
              </button>
            </div>

            {replay &&
            (replay.status === "pending" || replay.status === "running") ? (
              <p className="aw-caption">{tSt("replayRunning")} · {replay.status}</p>
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
                  href={`/strategies/${active.id}`}
                  className="aw-text-link text-[12px]"
                >
                  {t("planFullReport")}
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
