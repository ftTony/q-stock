"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { SubmitButton } from "@/components/ui/submit-button";
import { QtSelect } from "@/components/ui/qt-select";
import { StrategyRulesSummary } from "@/components/strategy/strategy-rules-summary";
import {
  StrategyReplayPanel,
  type ReplayResultView,
} from "@/components/strategy/strategy-replay-panel";

type Strategy = {
  id: string;
  name: string;
  description: string | null;
  rules: unknown;
  isTemplate: boolean;
  userId: string | null;
};

type Replay = {
  id: string;
  status: string;
  symbol: string;
  assetType: string;
  error: string | null;
  result: ReplayResultView | null;
};

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function StrategyDetail({ strategyId }: { strategyId: string }) {
  const t = useTranslations("strategies");
  const { data: session } = useSession();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [symbol, setSymbol] = useState("AAPL");
  const [assetType, setAssetType] = useState("stock");
  const [rangeFrom, setRangeFrom] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 2);
    return isoDate(d);
  });
  const [rangeTo, setRangeTo] = useState(() => isoDate(new Date()));
  const [replays, setReplays] = useState<Replay[]>([]);
  const [active, setActive] = useState<Replay | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/strategies/${strategyId}`);
    if (!res.ok) return;
    const data = await res.json();
    setStrategy(data.strategy);
    setName(data.strategy.name);
    setDescription(data.strategy.description ?? "");
  }, [strategyId]);

  const loadReplays = useCallback(async () => {
    if (!session?.user) return;
    const res = await fetch(`/api/strategies/${strategyId}/replay`);
    if (!res.ok) return;
    const data = await res.json();
    setReplays(data.replays ?? []);
  }, [session?.user, strategyId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadReplays();
  }, [loadReplays]);

  useEffect(() => {
    if (!active || active.status === "done" || active.status === "failed")
      return;
    const timer = setInterval(async () => {
      const res = await fetch(
        `/api/strategies/${strategyId}/replay?replayId=${active.id}`,
      );
      if (!res.ok) return;
      const data = await res.json();
      setActive(data.replay);
      if (data.replay.status === "done" || data.replay.status === "failed") {
        void loadReplays();
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [active, strategyId, loadReplays]);

  const canEdit =
    Boolean(session?.user) && strategy != null && !strategy.isTemplate;

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!canEdit) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/strategies/${strategyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || t("saveFailed"));
        return;
      }
      setStrategy(data.strategy);
      setMsg(t("saved"));
    } finally {
      setBusy(false);
    }
  }

  async function startReplay(e: FormEvent) {
    e.preventDefault();
    if (!session?.user) {
      setMsg(t("loginHint"));
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/strategies/${strategyId}/replay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          assetType,
          rangeFrom: `${rangeFrom}T00:00:00.000Z`,
          rangeTo: `${rangeTo}T23:59:59.000Z`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || t("replayFailed"));
        return;
      }
      setActive(data.replay);
      await loadReplays();
    } finally {
      setBusy(false);
    }
  }

  if (!strategy) {
    return <p className="text-sm text-[var(--muted)]">{t("loading")}</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <form
            onSubmit={(e) => void save(e)}
            className="flex flex-col gap-2 sm:flex-row sm:items-end"
          >
            <div className="min-w-0 flex-1">
              <label className="mb-1 block text-[10px] text-[var(--muted)]">
                {t("name")}
              </label>
              <input
                className="qt-input h-8 w-full px-2 text-sm font-medium"
                value={name}
                disabled={!canEdit}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            {canEdit ? (
              <SubmitButton
                type="submit"
                loading={busy}
                loadingLabel={t("loading")}
                className="qt-btn qt-btn-primary h-8 px-3 text-xs"
              >
                {t("save")}
              </SubmitButton>
            ) : (
              <span className="rounded border border-[var(--border)] px-2 py-1 text-[10px] text-[var(--muted)]">
                {strategy.isTemplate ? t("templates") : t("mine")}
              </span>
            )}
          </form>
          <textarea
            className="qt-input mt-2 w-full px-2 py-1.5 text-[12px] text-[var(--muted)]"
            rows={2}
            value={description}
            disabled={!canEdit}
            placeholder={t("description")}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <p className="max-w-xs text-[10px] leading-relaxed text-[var(--muted)]">
          {t("disclaimer")}
        </p>
      </div>

      {msg ? (
        <p className="text-[12px] text-[var(--muted)]">{msg}</p>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-[13px] font-medium">{t("rules")}</h2>
            <div className="flex items-center gap-2">
              <Link
                href="/tools/position"
                className="text-[11px] text-[var(--brand-text)] hover:underline"
              >
                {t("positionLink")}
              </Link>
              <button
                type="button"
                className="text-[11px] text-[var(--muted)] hover:underline"
                onClick={() => setShowJson((v) => !v)}
              >
                {showJson ? t("hideJson") : t("showJson")}
              </button>
            </div>
          </div>
          {showJson ? (
            <pre className="qt-scroll max-h-56 overflow-auto rounded-md border border-[var(--border)] bg-[var(--surface-2)]/30 p-2.5 text-[11px] leading-relaxed">
              {JSON.stringify(strategy.rules, null, 2)}
            </pre>
          ) : (
            <StrategyRulesSummary rules={strategy.rules} />
          )}
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3">
          <h2 className="mb-2 text-[13px] font-medium">{t("replay")}</h2>
          <form
            onSubmit={(e) => void startReplay(e)}
            className="space-y-2"
          >
            <div>
              <label className="mb-1 block text-[10px] text-[var(--muted)]">
                {t("symbol")}
              </label>
              <input
                className="qt-input h-8 w-full px-2 text-sm uppercase"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] text-[var(--muted)]">
                {t("market")}
              </label>
              <QtSelect
                value={assetType}
                onChange={setAssetType}
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

          {replays.length > 0 ? (
            <ul className="mt-3 space-y-1 border-t border-[var(--border)] pt-2">
              {replays.slice(0, 5).map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    className={`w-full rounded px-1.5 py-1 text-left text-[11px] tabular-nums hover:bg-[var(--surface-2)] ${
                      active?.id === r.id
                        ? "bg-[var(--brand-soft)] text-[var(--brand-text)]"
                        : "text-[var(--muted)]"
                    }`}
                    onClick={() => setActive(r)}
                  >
                    {r.symbol} · {r.status}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>

      {active ? (
        <StrategyReplayPanel
          status={active.status}
          error={active.error}
          result={active.result}
        />
      ) : null}
    </div>
  );
}
