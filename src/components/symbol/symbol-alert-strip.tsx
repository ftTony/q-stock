"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";
import { QtSelect } from "@/components/ui/qt-select";
import { IconBell } from "@/components/ui/icon-bell";

type Props = {
  condition: "gte" | "lte";
  onConditionChange: (v: "gte" | "lte") => void;
  price: string;
  onPriceChange: (v: string) => void;
  busy: boolean;
  message: string | null;
  onSubmit: (e: FormEvent) => void;
  /** @deprecated Always icon + popover; kept for call-site compat. */
  compact?: boolean;
};

export function SymbolAlertStrip({
  condition,
  onConditionChange,
  price,
  onPriceChange,
  busy,
  message,
  onSubmit,
}: Props) {
  const t = useTranslations("symbol");
  const tAlerts = useTranslations("alerts");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (message === "OK") setOpen(false);
  }, [message]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={t("setAlert")}
        aria-label={t("setAlert")}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--aw-parchment,var(--surface-2))] hover:text-[var(--foreground)]"
      >
        <IconBell className="h-5 w-5" />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={t("setAlert")}
          className="aw-alert-popover absolute right-0 top-full z-40 mt-1 w-[min(18rem,calc(100vw-2rem))] border border-[var(--border)] bg-[var(--panel)] p-3 shadow-lg"
        >
          <p className="aw-caption mb-2.5">{t("setAlert")}</p>
          <form onSubmit={onSubmit} className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <QtSelect
                value={condition}
                onChange={(v) => onConditionChange(v as "gte" | "lte")}
                aria-label={tAlerts("condition")}
                className="min-w-0 flex-1"
                triggerClassName="aw-alert-field h-8 w-full px-2.5 text-[12px]"
                options={[
                  { value: "gte", label: tAlerts("gte") },
                  { value: "lte", label: tAlerts("lte") },
                ]}
              />
              <input
                type="number"
                step="any"
                required
                autoFocus
                value={price}
                onChange={(e) => onPriceChange(e.target.value)}
                placeholder={tAlerts("triggerPrice")}
                aria-label={tAlerts("triggerPrice")}
                className="aw-alert-field h-8 w-[5.5rem] shrink-0 px-2 text-[12px] tabular-nums"
              />
            </div>
            <SubmitButton
              type="submit"
              loading={busy}
              loadingLabel={tCommon("loading")}
              className="aw-btn-pill aw-alert-submit !h-8 w-full !text-[12px]"
            >
              {tAlerts("create")}
            </SubmitButton>
            {message && message !== "OK" ? (
              <p className="aw-caption">{message}</p>
            ) : null}
          </form>
        </div>
      ) : null}
    </div>
  );
}
