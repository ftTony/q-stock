"use client";

import { FormEvent, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  StrategyDetailRulesPanel,
  type RulesMode,
} from "@/components/strategy/strategy-detail-rules-panel";
import { StrategyDetailReplayAside } from "@/components/strategy/strategy-detail-replay-aside";
import { type ReplayResultView } from "@/components/strategy/strategy-replay-panel";
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
  const [deleteOpen, setDeleteOpen] = useState(false);
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

  function requestRemoveStrategy() {
    if (!canEdit) return;
    setDeleteOpen(true);
  }

  async function confirmRemoveStrategy() {
    if (!canEdit) return;
    setMsg(null);
    try {
      await deleteMut.mutateAsync(strategyId);
      setDeleteOpen(false);
      setTab("mine");
      router.push("/strategies");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : t("deleteFailed"));
    }
  }

  if (detailQuery.isLoading) {
    return <p className="text-sm text-[var(--muted)]">{t("loading")}</p>;
  }

  if (!strategy) {
    const missing =
      detailQuery.isError &&
      detailQuery.error instanceof Error &&
      /not found/i.test(detailQuery.error.message);
    return (
      <p className={`text-sm ${missing ? "text-[var(--muted)]" : "text-[var(--down)]"}`}>
        {missing
          ? t("strategyMissing")
          : detailQuery.error instanceof Error
            ? detailQuery.error.message
            : t("loadFailed")}
      </p>
    );
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
        onDelete={requestRemoveStrategy}
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

        <StrategyDetailReplayAside
          strategyId={strategyId}
          strategyName={name}
          symbol={symbol}
          assetType={assetType}
          rangeFrom={rangeFrom}
          rangeTo={rangeTo}
          busy={busy}
          quota={quota}
          replays={replays}
          active={active}
          signedIn={Boolean(session?.user)}
          onSymbolChange={setSymbol}
          onAssetTypeChange={setAssetType}
          onRangeFromChange={setRangeFrom}
          onRangeToChange={setRangeTo}
          onStartReplay={(e) => void startReplay(e)}
          onSelectReplay={selectReplay}
          onQuota={(next) => {
            qc.setQueryData(
              queryKeys.strategies.replays(strategyId),
              (prev: { replays?: Replay[]; quota?: Quota } | undefined) =>
                prev ? { ...prev, quota: next } : prev,
            );
          }}
          onShareChange={
            session?.user && active
              ? (token) => patchShareToken(active.id, token)
              : undefined
          }
        />
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirm")}
        cancelLabel={t("blockModalCancel")}
        confirmLabel={t("delete")}
        tone="danger"
        busy={deleting}
        onCancel={() => {
          if (!deleting) setDeleteOpen(false);
        }}
        onConfirm={() => void confirmRemoveStrategy()}
      />
    </div>
  );
}
