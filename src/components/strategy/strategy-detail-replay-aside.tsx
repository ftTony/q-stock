"use client";

import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";
import { QtSelect } from "@/components/ui/qt-select";
import { SymbolSearchField } from "@/components/ui/symbol-search-field";
import { StrategyLabTools } from "@/components/strategy/strategy-lab-tools";
import { StrategyReplayResultDrawer } from "@/components/strategy/strategy-replay-result-drawer";
import type { ReplayResultView } from "@/components/strategy/strategy-replay-panel";
import type { AssetType } from "@/lib/types";

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

type Props = {
  strategyId: string;
  strategyName: string;
  symbol: string;
  assetType: AssetType;
  rangeFrom: string;
  rangeTo: string;
  busy: boolean;
  quota: Quota | null;
  replays: Replay[];
  active: Replay | null;
  signedIn: boolean;
  onSymbolChange: (symbol: string) => void;
  onAssetTypeChange: (assetType: AssetType) => void;
  onRangeFromChange: (value: string) => void;
  onRangeToChange: (value: string) => void;
  onStartReplay: (e: FormEvent) => void;
  onSelectReplay: (replay: Replay) => void;
  onQuota: (next: Quota) => void;
  onShareChange?: (token: string | null) => void;
};

/** Right-rail replay form + recent list for strategy detail. */
export function StrategyDetailReplayAside({
  strategyId,
  strategyName,
  symbol,
  assetType,
  rangeFrom,
  rangeTo,
  busy,
  quota,
  replays,
  active,
  signedIn,
  onSymbolChange,
  onAssetTypeChange,
  onRangeFromChange,
  onRangeToChange,
  onStartReplay,
  onSelectReplay,
  onQuota,
  onShareChange,
}: Props) {
  const t = useTranslations("strategies");

  return (
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
      <form onSubmit={onStartReplay} className="space-y-2">
        <SymbolSearchField
          value={symbol}
          assetType={assetType}
          onChange={onSymbolChange}
          onSelect={(r) => {
            onSymbolChange(r.symbol);
            onAssetTypeChange(r.assetType);
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
            onChange={(v) => onAssetTypeChange(v as AssetType)}
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
              onChange={(e) => onRangeFromChange(e.target.value)}
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
              onChange={(e) => onRangeToChange(e.target.value)}
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

      {signedIn ? (
        <div className="mt-3 border-t border-[var(--border)] pt-3">
          <StrategyLabTools
            compact
            strategyId={strategyId}
            strategyName={strategyName}
            symbol={symbol}
            assetType={assetType}
            rangeFrom={rangeFrom}
            rangeTo={rangeTo}
            quota={quota}
            onQuota={onQuota}
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
                    onClick={() => onSelectReplay(r)}
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
            replay={{
              ...active,
              strategyId,
            }}
            onShareChange={onShareChange}
          />
        </div>
      ) : null}
    </section>
  );
}
