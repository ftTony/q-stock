"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { InlineLoading } from "@/components/ui/panel-skeleton";
import type { AssetType } from "@/lib/types";

export type HistorySessionRow = {
  id: string;
  title: string;
  messageCount: number;
  updatedAt: string;
};

export function AiChatHistoryPanel(props: {
  symbol: string;
  assetType: AssetType;
  activeSessionId: string | null;
  onSelect: (sessionId: string) => void;
  onClose: () => void;
  onDeleted?: (sessionId: string) => void;
}) {
  const t = useTranslations("aiChat");
  const tCommon = useTranslations("common");
  const [rows, setRows] = useState<HistorySessionRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const qs = new URLSearchParams({
          symbol: props.symbol,
          assetType: props.assetType,
        });
        const res = await fetch(`/api/ai/chat/sessions?${qs}`);
        if (!res.ok) throw new Error("load");
        const data = (await res.json()) as { sessions: HistorySessionRow[] };
        if (!cancelled) setRows(data.sessions ?? []);
      } catch {
        if (!cancelled) {
          setError(t("historyLoadError"));
          setRows([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [props.symbol, props.assetType, t]);

  async function onDelete(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/ai/chat/sessions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) return;
      setRows((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
      props.onDeleted?.(id);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold">{t("historyTitle")}</h3>
        <button
          type="button"
          onClick={props.onClose}
          className="qt-btn-ghost rounded-md px-2 py-1 text-[14px] text-[var(--muted)]"
        >
          {t("historyBack")}
        </button>
      </div>
      <p className="text-sm text-[var(--muted)]">
        {t("historySubtitle", { symbol: props.symbol })}
      </p>

      {rows === null && <InlineLoading label={tCommon("loading")} />}
      {error && <p className="text-sm text-[var(--down)]">{error}</p>}

      {rows && rows.length === 0 && !error && (
        <p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted)]">
          {t("historyEmpty")}
        </p>
      )}

      {rows && rows.length > 0 && (
        <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)]">
          {rows.map((row) => {
            const active = row.id === props.activeSessionId;
            return (
              <li
                key={row.id}
                className={`flex items-start gap-2 px-3 py-2.5 ${
                  active ? "bg-[var(--brand-soft)]/50" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => props.onSelect(row.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-[14px] font-medium">{row.title}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {t("historyMeta", {
                      count: row.messageCount,
                      time: formatShort(row.updatedAt),
                    })}
                  </p>
                </button>
                <button
                  type="button"
                  disabled={busyId === row.id}
                  onClick={() => void onDelete(row.id)}
                  className="qt-btn-ghost shrink-0 rounded-md px-2 py-1 text-xs text-[var(--muted)] hover:text-[var(--down)] disabled:opacity-50"
                >
                  {t("historyDelete")}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function formatShort(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  } catch {
    return iso;
  }
}
