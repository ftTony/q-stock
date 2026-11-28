"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { IconBell } from "@/components/ui/icon-bell";
import { IconHeart } from "@/components/ui/icon-heart";
import { IconRobot } from "@/components/ui/icon-robot";

type Props = {
  onOpenTrade: () => void;
  onOpenPlan: () => void;
  onOpenAi: () => void;
  onToggleWatchlist: () => void;
  inWatchlist: boolean;
  watchBusy?: boolean;
  label?: string;
};

/**
 * H5 bottom chrome: primary「交易」+ 计划 / 自选 / AI / 提醒.
 * Quote bar keeps「交易」on desktop only; floating AI FAB is off on H5.
 */
export function SymbolMobileTradeBar({
  onOpenTrade,
  onOpenPlan,
  onOpenAi,
  onToggleWatchlist,
  inWatchlist,
  watchBusy = false,
  label,
}: Props) {
  const t = useTranslations("symbol");
  const tRail = useTranslations("symbolRail");
  const tradeLabel = label ?? t("tradeDock");
  const planLabel = `${tRail("plan")} / ${tRail("review")}`;
  const watchLabel = inWatchlist ? t("inWatchlist") : t("addWatchlist");
  const alertsLabel = t("setAlert");

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--aw-hairline,var(--border))] bg-[var(--aw-canvas,var(--panel))] p-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] lg:hidden"
      data-tour="mobile-trade-bar"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenTrade}
          className="aw-btn-pill flex !h-10 min-w-0 flex-1 items-center justify-center !text-[16px] font-semibold tracking-tight"
          title={tradeLabel}
          aria-label={tradeLabel}
          data-tour="rail-order"
        >
          {tradeLabel}
        </button>

        <div className="flex shrink-0 items-center gap-0.5">
          <IconAction
            label={planLabel}
            onClick={onOpenPlan}
            tour="mobile-plan"
          >
            <IconPlan className="h-6 w-6" />
          </IconAction>

          <IconAction
            label={watchLabel}
            disabled={watchBusy}
            pressed={inWatchlist}
            onClick={onToggleWatchlist}
            tour="mobile-watch"
          >
            <IconHeart
              filled={inWatchlist}
              className={`h-6 w-6 ${
                inWatchlist ? "text-[#e11d48]" : "currentColor"
              }`}
            />
          </IconAction>

          <IconAction label={t("openAi")} onClick={onOpenAi} tour="mobile-ai">
            <IconRobot className="h-6 w-6" />
          </IconAction>

          <Link
            href="/alerts"
            className="inline-flex h-10 w-11 items-center justify-center text-[var(--muted)] transition hover:text-[var(--foreground)] active:opacity-70"
            title={alertsLabel}
            aria-label={alertsLabel}
            data-tour="mobile-alerts"
          >
            <IconBell className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Plan + review: a checklist board (no new icon dependency). */
function IconPlan({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 9h7M7 13h7M7 17h4" />
      <path d="M17 8.5l1.2 1.2L20 8" />
    </svg>
  );
}

function IconAction({
  label,
  children,
  onClick,
  disabled,
  pressed,
  tour,
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  tour?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      data-tour={tour}
      className="inline-flex h-10 w-11 items-center justify-center text-[var(--muted)] transition hover:text-[var(--foreground)] active:opacity-70 disabled:opacity-50"
    >
      {children}
    </button>
  );
}
