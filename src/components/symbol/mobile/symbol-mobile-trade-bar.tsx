"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { IconBell } from "@/components/ui/icon-bell";
import { IconHeart } from "@/components/ui/icon-heart";
import { IconRobot } from "@/components/ui/icon-robot";

type Props = {
  onOpenTrade: () => void;
  onOpenAi: () => void;
  onToggleWatchlist: () => void;
  inWatchlist: boolean;
  watchBusy?: boolean;
  label?: string;
};

/**
 * H5 bottom chrome: primary「交易」+ 自选 / AI / 提醒.
 * Quote bar keeps「交易」on desktop only; floating AI FAB is off on H5.
 */
export function SymbolMobileTradeBar({
  onOpenTrade,
  onOpenAi,
  onToggleWatchlist,
  inWatchlist,
  watchBusy = false,
  label,
}: Props) {
  const t = useTranslations("symbol");
  const tradeLabel = label ?? t("tradeDock");
  const watchLabel = inWatchlist ? t("inWatchlist") : t("addWatchlist");
  const alertsLabel = t("setAlert");

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--aw-hairline,var(--border))] bg-[var(--aw-canvas,var(--panel))] px-3 pt-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] lg:hidden"
      data-tour="mobile-trade-bar"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenTrade}
          className="aw-btn-pill flex !h-12 min-w-0 flex-1 items-center justify-center !text-[16px] font-semibold tracking-tight"
          title={tradeLabel}
          aria-label={tradeLabel}
          data-tour="rail-order"
        >
          {tradeLabel}
        </button>

        <div className="flex shrink-0 items-center gap-0.5">
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
            className="inline-flex h-12 w-11 items-center justify-center text-[var(--muted)] transition hover:text-[var(--foreground)] active:opacity-70"
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
      className="inline-flex h-12 w-11 items-center justify-center text-[var(--muted)] transition hover:text-[var(--foreground)] active:opacity-70 disabled:opacity-50"
    >
      {children}
    </button>
  );
}
