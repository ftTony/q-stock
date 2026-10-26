"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  StrategyReplayPanel,
  type ReplayResultView,
} from "@/components/strategy/strategy-replay-panel";

function fmtPct(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

export function StrategyShareView({ token }: { token: string }) {
  const t = useTranslations("strategies");
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "error" }
    | {
        kind: "replay";
        strategyName: string;
        result: ReplayResultView | null;
        symbol: string;
      }
    | { kind: "lab"; labKind: string; result: unknown }
  >({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await fetch(
        `/api/strategies/share/${encodeURIComponent(token)}`,
      );
      if (!res.ok || cancelled) {
        if (!cancelled) setState({ kind: "error" });
        return;
      }
      const data = await res.json();
      if (cancelled) return;
      if (data.kind === "replay") {
        setState({
          kind: "replay",
          strategyName: data.strategyName,
          symbol: data.replay?.symbol ?? "",
          result: data.replay?.result ?? null,
        });
        return;
      }
      if (data.kind === "lab") {
        setState({
          kind: "lab",
          labKind: data.report?.kind ?? "lab",
          result: data.report?.result,
        });
        return;
      }
      setState({ kind: "error" });
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state.kind === "loading") {
    return <p className="text-sm text-[var(--muted)]">{t("loading")}</p>;
  }
  if (state.kind === "error") {
    return (
      <div className="space-y-2">
        <p className="text-sm text-[var(--down)]">{t("shareNotFound")}</p>
        <Link href="/strategies" className="text-[12px] text-[var(--brand-text)]">
          {t("back")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5">
        <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
          {t("shareReadonly")}
        </p>
        {state.kind === "replay" ? (
          <h1 className="mt-1 text-base font-medium">
            {state.strategyName}
            {state.symbol ? (
              <span className="ml-2 text-[var(--muted)]">{state.symbol}</span>
            ) : null}
          </h1>
        ) : (
          <h1 className="mt-1 text-base font-medium">
            {state.labKind === "compare"
              ? t("labCompare")
              : state.labKind === "param_grid"
                ? t("labParamGrid")
                : t("labBasket")}
          </h1>
        )}
        <p className="mt-1 text-[11px] text-[var(--muted)]">{t("disclaimer")}</p>
      </div>

      {state.kind === "replay" ? (
        <StrategyReplayPanel
          status="done"
          error={null}
          result={state.result}
        />
      ) : (
        <LabShareBody kind={state.labKind} result={state.result} />
      )}

      <Link href="/strategies" className="text-[12px] text-[var(--brand-text)]">
        {t("back")}
      </Link>
    </div>
  );
}

function LabShareBody({
  kind,
  result,
}: {
  kind: string;
  result: unknown;
}) {
  const t = useTranslations("strategies");
  const data = result as {
    legs?: Array<{
      name: string;
      metrics: {
        totalReturnPct: number;
        maxDrawdownPct: number;
        tradeCount: number;
      };
    }>;
    rows?: Array<Record<string, unknown>>;
    paramId?: string;
  } | null;

  if (!data) {
    return <p className="text-sm text-[var(--muted)]">—</p>;
  }

  if (kind === "compare" && data.legs) {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {data.legs.map((leg) => (
          <div
            key={leg.name}
            className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3 text-[12px]"
          >
            <div className="font-medium">{leg.name}</div>
            <div className="mt-1 text-[var(--muted)]">
              {t("return")}: {fmtPct(leg.metrics.totalReturnPct)}
            </div>
            <div className="text-[var(--muted)]">
              {t("maxDd")}: {fmtPct(leg.metrics.maxDrawdownPct)}
            </div>
            <div className="text-[var(--muted)]">
              {t("trades")}: {leg.metrics.tradeCount}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (Array.isArray(data.rows)) {
    return (
      <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]">
        <table className="w-full text-left text-[12px]">
          <thead className="text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">
                {kind === "param_grid" ? t("labParamValue") : t("symbol")}
              </th>
              <th className="px-3 py-2">{t("return")}</th>
              <th className="px-3 py-2">{t("maxDd")}</th>
              <th className="px-3 py-2">{t("trades")}</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, i) => {
              const label =
                kind === "param_grid"
                  ? String(row.value ?? "—")
                  : String(row.symbol ?? "—");
              const ok = row.ok !== false;
              const metrics = (row.metrics ?? {}) as {
                totalReturnPct?: number;
                maxDrawdownPct?: number;
                tradeCount?: number;
              };
              return (
                <tr key={i} className="border-t border-[var(--border)]">
                  <td className="px-3 py-1.5">{label}</td>
                  {ok ? (
                    <>
                      <td className="px-3 py-1.5 tabular-nums">
                        {fmtPct(metrics.totalReturnPct)}
                      </td>
                      <td className="px-3 py-1.5 tabular-nums">
                        {fmtPct(metrics.maxDrawdownPct)}
                      </td>
                      <td className="px-3 py-1.5 tabular-nums">
                        {metrics.tradeCount ?? "—"}
                      </td>
                    </>
                  ) : (
                    <td className="px-3 py-1.5 text-[var(--down)]" colSpan={3}>
                      {String(row.error ?? "—")}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return <p className="text-sm text-[var(--muted)]">—</p>;
}
