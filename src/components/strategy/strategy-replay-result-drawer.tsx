"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { SideDrawer } from "@/components/ui/side-drawer";
import {
  StrategyReplayPanel,
  type ReplayResultView,
} from "@/components/strategy/strategy-replay-panel";
import { StrategyReplayActions } from "@/components/strategy/strategy-replay-actions";

export type ReplayDrawerItem = {
  id: string;
  status: string;
  symbol: string;
  error: string | null;
  result: ReplayResultView | null;
  shareToken?: string | null;
};

function fmtPct(n?: number | null) {
  if (n == null || !Number.isFinite(n)) return "—";
  const s = `${n.toFixed(2)}%`;
  return n > 0 ? `+${s}` : s;
}

export function StrategyReplayResultDrawer({
  replay,
  onShareChange,
}: {
  replay: ReplayDrawerItem | null;
  onShareChange?: (token: string | null) => void;
}) {
  const t = useTranslations("strategies");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (replay?.id) setOpen(true);
  }, [replay?.id]);

  if (!replay) return null;

  const ret = replay.result?.totalReturnPct;
  const done = replay.status === "done";
  const failed = replay.status === "failed";
  const statusKey =
    replay.status === "done"
      ? "statusDone"
      : replay.status === "failed"
        ? "statusFailed"
        : replay.status === "running"
          ? "statusRunning"
          : "statusPending";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-left transition hover:border-[color-mix(in_srgb,var(--brand)_35%,var(--border))]"
      >
        <span className="min-w-0">
          <span className="block text-[13px] font-medium text-[var(--foreground)]">
            {t("replayResult")}
            <span className="ml-2 font-medium tabular-nums">{replay.symbol}</span>
          </span>
          <span className="mt-0.5 block text-[12px] text-[var(--muted)]">
            {t(statusKey)}
            {done ? (
              <>
                <span className="mx-1.5 text-[var(--border)]">·</span>
                <span
                  className={
                    (ret ?? 0) >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"
                  }
                >
                  {fmtPct(ret)}
                </span>
              </>
            ) : null}
            {failed && replay.error ? (
              <>
                <span className="mx-1.5 text-[var(--border)]">·</span>
                <span className="text-[var(--down)]">{replay.error}</span>
              </>
            ) : null}
          </span>
        </span>
        <span className="ml-2 shrink-0 text-[12px] text-[var(--brand-text)]">
          {t("labOpenDrawer")}
        </span>
      </button>

      <SideDrawer
        open={open}
        onClose={() => setOpen(false)}
        title={t("replayResult")}
        titleAside={`${replay.symbol} · ${t(statusKey)}`}
        widthClassName="w-full max-w-[min(100vw,36rem)] sm:max-w-[36rem]"
      >
        <div className="space-y-3 px-4 py-4 sm:px-5">
          <StrategyReplayPanel
            status={replay.status}
            error={replay.error}
            result={replay.result}
          />
          {onShareChange ? (
            <StrategyReplayActions
              replayId={replay.id}
              status={replay.status}
              shareToken={replay.shareToken ?? null}
              onShareChange={onShareChange}
            />
          ) : null}
        </div>
      </SideDrawer>
    </>
  );
}
