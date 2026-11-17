"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { SubmitButton } from "@/components/ui/submit-button";
import type { AlertRow } from "@/hooks/query/use-alerts";
import type { AssetType } from "@/lib/types";

function statusTone(status: AlertRow["status"]) {
  if (status === "active") {
    return "bg-[var(--brand-soft)] text-[var(--brand-text)]";
  }
  if (status === "triggered") {
    return "bg-[var(--surface-2)] text-[var(--foreground)]";
  }
  return "bg-[var(--surface-2)] text-[var(--muted)]";
}

function freqKey(frequency: AlertRow["frequency"]) {
  if (frequency === "once") return "freq_once" as const;
  if (frequency === "daily") return "freq_daily" as const;
  return "freq_always" as const;
}

type Props = {
  alerts: AlertRow[];
  actionId: string | null;
  marketLabel: (type: AssetType) => string;
  onPatchStatus: (id: string, next: "active" | "disabled") => void;
  onRemove: (id: string) => void;
  loadingLabel: string;
};

/** Compact alert rows — terminal density, status without up/down colors. */
export function AlertsList({
  alerts,
  actionId,
  marketLabel,
  onPatchStatus,
  onRemove,
  loadingLabel,
}: Props) {
  const t = useTranslations("alerts");

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1.5 px-6 py-12 text-center">
        <p className="text-[13px] font-medium text-[var(--foreground)]">
          {t("empty")}
        </p>
        <p className="max-w-sm text-[12px] leading-relaxed text-[var(--muted)]">
          {t("emptyHint")}
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[var(--border)]">
      {alerts.map((a) => (
        <li
          key={a.id}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-3 py-2.5 sm:grid-cols-[minmax(7rem,11rem)_minmax(0,1fr)_auto] sm:px-4"
        >
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <Link
              href={`/symbol/${a.assetType}/${a.symbol}`}
              className="text-[13px] font-semibold tracking-tight tabular-nums hover:text-[var(--brand-text)]"
            >
              {a.symbol}
            </Link>
            <span className="text-[11px] text-[var(--muted)]">
              {marketLabel(a.assetType)}
            </span>
            <span
              className={`rounded-sm px-1.5 py-px text-[10px] font-medium ${statusTone(a.status)}`}
            >
              {t(a.status)}
            </span>
          </div>

          <p className="col-span-2 min-w-0 text-[12px] tabular-nums text-[var(--muted)] sm:col-span-1 sm:justify-self-start">
            <span className="text-[var(--foreground)]">
              {a.condition === "gte" ? "≥" : "≤"} {a.triggerPrice}
            </span>
            <span className="mx-1.5 text-[var(--border)]">·</span>
            <span>{t(freqKey(a.frequency))}</span>
          </p>

          <div className="col-start-2 row-start-1 flex shrink-0 items-center gap-1 sm:col-start-3">
            {a.status === "active" ? (
              <button
                type="button"
                disabled={actionId === a.id}
                className="h-7 px-2 text-[12px] text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-50"
                onClick={() => onPatchStatus(a.id, "disabled")}
              >
                {t("disable")}
              </button>
            ) : (
              <SubmitButton
                type="button"
                loading={actionId === a.id}
                loadingLabel={loadingLabel}
                className="qt-btn qt-btn-ghost h-7 px-2.5 text-[12px]"
                onClick={() => onPatchStatus(a.id, "active")}
              >
                {t("reactivate")}
              </SubmitButton>
            )}
            <button
              type="button"
              disabled={actionId === a.id}
              className="h-7 px-1.5 text-[12px] text-[var(--muted)] hover:text-[var(--danger)] disabled:opacity-50"
              aria-label={t("delete")}
              title={t("delete")}
              onClick={() => {
                if (window.confirm(t("deleteConfirm"))) onRemove(a.id);
              }}
            >
              {t("delete")}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
