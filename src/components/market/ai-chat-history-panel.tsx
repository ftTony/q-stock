"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { EmptyStateBlock } from "@/components/symbol/symbol-empty-art";
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
    <div className="flex min-h-0 flex-1 flex-col px-5 pb-5 pt-3">
      <button
        type="button"
        onClick={props.onClose}
        className="mb-4 inline-flex w-fit items-center gap-0.5 self-start text-[13px] font-medium text-[var(--aw-primary)] transition hover:opacity-80"
      >
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          aria-hidden
        >
          <path
            d="M15 18l-6-6 6-6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {t("historyBack")}
      </button>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {rows === null && <InlineLoading label={tCommon("loading")} />}
        {error && (
          <p className="py-8 text-center text-[13px] text-[var(--down)]">
            {error}
          </p>
        )}

        {rows && rows.length === 0 && !error && (
          <EmptyStateBlock art="history" label={t("historyEmpty")} compact />
        )}

        {rows && rows.length > 0 && (
          <ul>
            {rows.map((row) => {
              const active = row.id === props.activeSessionId;
              return (
                <li
                  key={row.id}
                  className={`-mx-2 flex items-start gap-2 rounded-lg px-2 py-3 ${
                    active
                      ? "bg-[color-mix(in_srgb,var(--aw-primary)_6%,transparent)]"
                      : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => props.onSelect(row.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-[14px] font-medium tracking-[-0.12px] text-[var(--aw-ink)]">
                      {row.title}
                    </p>
                    <p className="mt-1 text-[12px] tabular-nums text-[var(--aw-ink-muted-48,var(--muted))]">
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
                    className="shrink-0 rounded-md px-2 py-1 text-[12px] text-[var(--aw-ink-muted-48,var(--muted))] hover:text-[var(--down)] disabled:opacity-50"
                  >
                    {t("historyDelete")}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
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
