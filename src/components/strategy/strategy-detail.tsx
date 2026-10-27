"use client";

import { FormEvent, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { SubmitButton } from "@/components/ui/submit-button";
import { QtSelect } from "@/components/ui/qt-select";
import { SymbolSearchField } from "@/components/ui/symbol-search-field";
import {
  StrategyDetailRulesPanel,
  type RulesMode,
} from "@/components/strategy/strategy-detail-rules-panel";
import { type ReplayResultView } from "@/components/strategy/strategy-replay-panel";
import { StrategyReplayResultDrawer } from "@/components/strategy/strategy-replay-result-drawer";
import { StrategyLabTools } from "@/components/strategy/strategy-lab-tools";
import { StrategyDetailHeader } from "@/components/strategy/strategy-detail-header";
import { replayErrorMessage } from "@/lib/strategy/replay-errors";
import {
  strategyRulesSchema,
  type StrategyRules,
} from "@/lib/strategy/rules";
import type { AssetType } from "@/lib/types";
import { queryKeys } from "@/lib/query/keys";
import {
  useDeleteStrategy,
  useStartStrategyReplay,
  useStrategyDetail,
  useStrategyReplayDetail,
  useStrategyReplayList,
  useUpdateStrategy,
} from "@/hooks/query/use-strategies";
import { useStrategiesLabStore } from "@/stores/strategies-lab-store";

type Replay = {
  id: string;
  status: string;
  symbol: string;
  assetType: string;
  error: string | null;
  result: ReplayResultView | null;
  shareToken?: string | null;
};

type Quota = { used: number; limit: number };

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function StrategyDetail({ strategyId }: { strategyId: string }) {
  const t = useTranslations("strategies");
  const locale = useLocale();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const replayIdParam = searchParams.get("replayId");

  const qc = useQueryClient();
  const signedIn = Boolean(session?.user);
  const detailQuery = useStrategyDetail(strategyId, locale);
  const updateMut = useUpdateStrategy(strategyId, locale);
  const deleteMut = useDeleteStrategy(locale);
  const startReplayMut = useStartStrategyReplay(strategyId);
  const setTab = useStrategiesLabStore((s) => s.setTab);
  const strategy = detailQuery.data?.strategy ?? null;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rulesJson, setRulesJson] = useState("");
  const [symbol, setSymbol] = useState("AAPL");
  const [assetType, setAssetType] = useState<AssetType>("stock");
  const [rangeFrom, setRangeFrom] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 2);
    return isoDate(d);
  });
  const [rangeTo, setRangeTo] = useState(() => isoDate(new Date()));
  const [activeId, setActiveId] = useState<string | null>(replayIdParam);
  const [msg, setMsg] = useState<string | null>(null);
  const [rulesMode, setRulesMode] = useState<RulesMode>("blocks");
  const [rules, setRules] = useState<StrategyRules | null>(null);

  const replaysQuery = useStrategyReplayList(strategyId, signedIn);
  const activeQuery = useStrategyReplayDetail(strategyId, activeId, {
    enabled: signedIn && Boolean(activeId),
    refetchInterval: (q) => {
      const status = (q.state.data as { replay?: Replay } | undefined)?.replay
        ?.status;
      if (!status || status === "done" || status === "failed") return false;
      return 2000;
    },
  });

  const replays = (replaysQuery.data?.replays ?? []) as Replay[];
  const active = (activeQuery.data?.replay as Replay | undefined) ?? null;
  const quota =
    (activeQuery.data?.quota as Quota | undefined) ??
    (replaysQuery.data?.quota as Quota | undefined) ??
    null;
  const busy = updateMut.isPending || startReplayMut.isPending;
  const deleting = deleteMut.isPending;

  useEffect(() => {
    setActiveId(replayIdParam);
  }, [replayIdParam]);

  useEffect(() => {
    if (active?.status === "done" || active?.status === "failed") {
      void replaysQuery.refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch on terminal status only
  }, [active?.status]);

  useEffect(() => {
    const s = detailQuery.data?.strategy;
    if (!s) return;
    setName(s.name);
    setDescription(s.description ?? "");
    const checked = strategyRulesSchema.safeParse(s.rules);
    if (checked.success) {
      setRules(checked.data);
      setRulesJson(JSON.stringify(checked.data, null, 2));
    } else {
      setRules(null);
      setRulesJson(JSON.stringify(s.rules, null, 2));
    }
    // Seed drafts on navigate / first load only — not on every cache write.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [strategyId, locale, detailQuery.data?.strategy?.id]);

  const canEdit =
    Boolean(session?.user) && strategy != null && !strategy.isTemplate;

  function selectReplay(r: Replay) {
    setActiveId(r.id);
    router.replace(`/strategies/${strategyId}?replayId=${r.id}`);
  }

  function patchShareToken(replayId: string, token: string | null) {
    qc.setQueryData(
      ["strategies", "replay", strategyId, replayId],
      (prev: { replay?: Replay } | undefined) =>
        prev?.replay
          ? { ...prev, replay: { ...prev.replay, shareToken: token } }
          : prev,
    );
  }

  function applyRules(next: StrategyRules) {
    setRules(next);
    setRulesJson(JSON.stringify(next, null, 2));
  }

  function switchRulesMode(mode: RulesMode) {
    if (mode === rulesMode) return;
    if (mode === "blocks") {
      try {
        const parsed = JSON.parse(rulesJson) as unknown;
        const checked = strategyRulesSchema.safeParse(parsed);
        if (!checked.success) {
          setMsg(t("rulesInvalid"));
          return;
        }
        applyRules(checked.data);
      } catch {
        setMsg(t("rulesInvalid"));
        return;
      }
    } else if (rules) {
      setRulesJson(JSON.stringify(rules, null, 2));
    }
    setRulesMode(mode);
    setMsg(null);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!canEdit) return;
    setMsg(null);
    try {
      let nextRules: StrategyRules;
      // Prefer structured rules from blocks / Python preview; JSON textarea
      // is only authoritative when it still parses (advanced edit).
      if (rulesMode === "code") {
        try {
          const parsed = JSON.parse(rulesJson) as unknown;
          const checked = strategyRulesSchema.safeParse(parsed);
          if (checked.success) {
            nextRules = checked.data;
          } else if (rules) {
            const fromBlocks = strategyRulesSchema.safeParse(rules);
            if (!fromBlocks.success) {
              setMsg(t("rulesInvalid"));
              return;
            }
            nextRules = fromBlocks.data;
          } else {
            setMsg(t("rulesInvalid"));
            return;
          }
        } catch {
          if (rules) {
            const fromBlocks = strategyRulesSchema.safeParse(rules);
            if (!fromBlocks.success) {
              setMsg(t("rulesInvalid"));
              return;
            }
            nextRules = fromBlocks.data;
          } else {
            setMsg(t("rulesInvalid"));
            return;
          }
        }
      } else if (rules) {
        const checked = strategyRulesSchema.safeParse(rules);
        if (!checked.success) {
          setMsg(t("rulesInvalid"));
          return;
        }
        nextRules = checked.data;
      } else {
        setMsg(t("rulesInvalid"));
        return;
      }
      await updateMut.mutateAsync({
        name,
        description,
        rules: nextRules,
      });
      applyRules(nextRules);
      setMsg(t("saved"));
    } catch (err) {
      setMsg(err instanceof Error ? err.message : t("saveFailed"));
    }
  }

  async function startReplay(e: FormEvent) {
    e.preventDefault();
    if (!session?.user) {
      setMsg(t("loginHint"));
      return;
    }
    setMsg(null);
    try {
      const data = await startReplayMut.mutateAsync({
        symbol,
        assetType,
        rangeFrom: `${rangeFrom}T00:00:00.000Z`,
        rangeTo: `${rangeTo}T23:59:59.000Z`,
      });
      const replay = data.replay as Replay | undefined;
      if (replay?.id) {
        setActiveId(replay.id);
        router.replace(`/strategies/${strategyId}?replayId=${replay.id}`);
      }
    } catch (err) {
      setMsg(
        replayErrorMessage(
          { error: err instanceof Error ? err.message : undefined },
          t,
        ),
      );
    }
  }

  async function removeStrategy() {
    if (!canEdit) return;
    if (!window.confirm(t("deleteConfirm"))) return;
    setMsg(null);
    try {
      await deleteMut.mutateAsync(strategyId);
      setTab("mine");
      router.push("/strategies");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : t("deleteFailed"));
    }
  }

  if (!strategy) {
    return <p className="text-sm text-[var(--muted)]">{t("loading")}</p>;
  }

  return (
    <div className="flex min-h-[calc(100dvh-6rem)] flex-col gap-3">
      <StrategyDetailHeader
        name={name}
        description={description}
        canEdit={canEdit}
        isTemplate={strategy.isTemplate}
        busy={busy}
        deleting={deleting}
        onNameChange={setName}
        onDescriptionChange={setDescription}
        onSave={(e) => void save(e)}
        onDelete={() => void removeStrategy()}
      />

      {msg ? (
        <p className="text-[12px] text-[var(--muted)]">{msg}</p>
      ) : null}

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-stretch">
        <StrategyDetailRulesPanel
          canEdit={canEdit}
          mode={rulesMode}
          onModeChange={switchRulesMode}
          rules={rules}
          rulesJson={rulesJson}
          onRulesChange={applyRules}
          onRulesJsonChange={setRulesJson}
        />

        <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3 lg:max-h-[calc(100dvh-10rem)] lg:overflow-y-auto">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-[13px] font-medium">{t("replay")}</h2>
            {quota ? (
              <span className="text-[10px] tabular-nums text-[var(--muted)]">
                {t("replayQuota", {
                  used: quota.used,
                  limit: quota.limit,
                })}
              </span>
            ) : null}
          </div>
          <form
            onSubmit={(e) => void startReplay(e)}
            className="space-y-2"
          >
            <SymbolSearchField
              value={symbol}
              assetType={assetType}
              onChange={setSymbol}
              onSelect={(r) => {
                setSymbol(r.symbol);
                setAssetType(r.assetType);
              }}
              label={t("symbol")}
              placeholder={t("symbolPlaceholder")}
              required
            />
            <div>
              <label className="mb-1 block text-[10px] text-[var(--muted)]">
                {t("market")}
              </label>
              <QtSelect
                value={assetType}
                onChange={(v) => setAssetType(v as AssetType)}
                options={[
                  { value: "stock", label: "US" },
                  { value: "hk", label: "HK" },
                  { value: "cn", label: "CN" },
                  { value: "crypto", label: "Crypto" },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[10px] text-[var(--muted)]">
                  {t("from")}
                </label>
                <input
                  type="date"
                  className="qt-input h-8 w-full px-1.5 text-[12px]"
                  value={rangeFrom}
                  onChange={(e) => setRangeFrom(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-[var(--muted)]">
                  {t("to")}
                </label>
                <input
                  type="date"
                  className="qt-input h-8 w-full px-1.5 text-[12px]"
                  value={rangeTo}
                  onChange={(e) => setRangeTo(e.target.value)}
                  required
                />
              </div>
            </div>
            <SubmitButton
              type="submit"
              loading={busy}
              loadingLabel={t("loading")}
              className="qt-btn qt-btn-primary h-9 w-full text-sm"
            >
              {t("runReplay")}
            </SubmitButton>
          </form>

          {session?.user ? (
            <div className="mt-3 border-t border-[var(--border)] pt-3">
              <StrategyLabTools
                compact
                strategyId={strategyId}
                strategyName={name}
                symbol={symbol}
                assetType={assetType}
                rangeFrom={rangeFrom}
                rangeTo={rangeTo}
                quota={quota}
                onQuota={(next) => {
                  qc.setQueryData(
                    queryKeys.strategies.replays(strategyId),
                    (prev: { replays?: Replay[]; quota?: Quota } | undefined) =>
                      prev ? { ...prev, quota: next } : prev,
                  );
                }}
              />
            </div>
          ) : null}

          {replays.length > 0 ? (
            <div className="mt-3 border-t border-[var(--border)] pt-3">
              <p className="mb-1.5 text-[12px] text-[var(--muted)]">
                {t("recentReplays")}
              </p>
              <ul className="overflow-hidden rounded-md border border-[var(--border)] divide-y divide-[var(--border)]">
                {replays.slice(0, 5).map((r) => {
                  const on = active?.id === r.id;
                  const statusKey =
                    r.status === "done"
                      ? "statusDone"
                      : r.status === "failed"
                        ? "statusFailed"
                        : r.status === "running"
                          ? "statusRunning"
                          : "statusPending";
                  const statusTone =
                    r.status === "done"
                      ? "text-[var(--brand-text)]"
                      : r.status === "failed"
                        ? "text-[var(--down)]"
                        : "text-[var(--muted)]";
                  const ret = r.result?.totalReturnPct;
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => selectReplay(r)}
                        className={`flex w-full items-center justify-between gap-2 px-2.5 py-2 text-left text-[13px] transition ${
                          on
                            ? "bg-[var(--brand-soft)]"
                            : "bg-[var(--panel)] hover:bg-[var(--surface-2)]/70"
                        }`}
                      >
                        <span className="flex min-w-0 items-baseline gap-2">
                          <span className="font-medium tabular-nums text-[var(--foreground)]">
                            {r.symbol}
                          </span>
                          <span className={`text-[12px] ${statusTone}`}>
                            {t(statusKey)}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 tabular-nums text-[12px] ${
                            typeof ret === "number"
                              ? ret >= 0
                                ? "text-[var(--up)]"
                                : "text-[var(--down)]"
                              : "text-[var(--muted)]"
                          }`}
                        >
                          {typeof ret === "number"
                            ? `${ret > 0 ? "+" : ""}${ret.toFixed(1)}%`
                            : "—"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          {active ? (
            <div className="mt-3 border-t border-[var(--border)] pt-3">
              <StrategyReplayResultDrawer
                replay={active}
                onShareChange={
                  session?.user
                    ? (token) => patchShareToken(active.id, token)
                    : undefined
                }
              />
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
