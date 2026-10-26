"use client";

import { useTranslations } from "next-intl";
import {
  IconRailCollapse,
  IconRailExpand,
} from "@/components/symbol/watchlist-toggle-icons";
import "./apple-workbench.css";

export type SideIconId = "ai" | "trade" | "news" | "comments";

type Props = {
  /** Currently open tool; null when none. */
  active: SideIconId | null;
  onSelect: (id: SideIconId) => void;
  /** Right quote/plan rail open — toggle lives on this far-right strip. */
  railOpen?: boolean;
  onToggleRail?: () => void;
};

const SW = 1.7;

/** Trade — chart in square. */
function IconTrade({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="4.5"
        y="4.5"
        width="15"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path
        d="M7.5 14.5l3-3.2 2.2 2.2 3.8-4.5"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** News — document. */
function IconNews({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 4.75h8.25L17.25 7v12.25A1 1 0 0 1 16.25 20.25h-8.5A1 1 0 0 1 6.75 19.25v-13.5A1 1 0 0 1 7.75 4.75"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <path
        d="M15.25 4.75V7h2M9 11h6M9 14.25h6M9 17.5h3.5"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Comments — speech bubbles. */
function IconComments({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5.5 6.5h9.2A2.3 2.3 0 0 1 17 8.8v4.2a2.3 2.3 0 0 1-2.3 2.3H10.2L7 18v-2.7H5.5A2.3 2.3 0 0 1 3.2 13V8.8A2.3 2.3 0 0 1 5.5 6.5z"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <path
        d="M17.2 9.2h1.3A2.3 2.3 0 0 1 20.8 11.5v3.6a2.3 2.3 0 0 1-2.3 2.3h-1.2L15.8 20v-2.6"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** AI — robot assistant (not chat bubble). */
function IconAi({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.2v2.2"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinecap="round"
      />
      <circle cx="12" cy="2.4" r="1" fill="currentColor" />
      <rect
        x="5"
        y="6.5"
        width="14"
        height="10"
        rx="3"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <circle cx="9.2" cy="11.2" r="1.15" fill="currentColor" />
      <circle cx="14.8" cy="11.2" r="1.15" fill="currentColor" />
      <path
        d="M9.4 14.2h5.2M3.8 11h1.4M18.8 11h1.4"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinecap="round"
      />
      <path
        d="M9 16.5v2a1.7 1.7 0 0 0 1.7 1.7h2.6A1.7 1.7 0 0 0 15 18.5v-2"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Item = {
  id: SideIconId;
  labelKey: "openAi" | "tradeDock" | "newsPress" | "comments";
  ruleBefore?: boolean;
};

const ITEMS: Item[] = [
  { id: "trade", labelKey: "tradeDock" },
  { id: "news", labelKey: "newsPress", ruleBefore: true },
  { id: "comments", labelKey: "comments" },
  { id: "ai", labelKey: "openAi" },
];

const ICONS: Record<SideIconId, typeof IconTrade> = {
  trade: IconTrade,
  news: IconNews,
  comments: IconComments,
  ai: IconAi,
};

/** Futu edge chrome — trade / news+press / comments / AI. */
export function SymbolSideIconRail({
  active,
  onSelect,
  railOpen = true,
  onToggleRail,
}: Props) {
  const t = useTranslations("symbol");

  return (
    <nav aria-label={t("sideDock")} className="aw-side-icon-rail">
      {onToggleRail ? (
        <>
          <button
            type="button"
            title={railOpen ? t("railCollapse") : t("railExpand")}
            aria-label={railOpen ? t("railCollapse") : t("railExpand")}
            aria-pressed={railOpen}
            onClick={onToggleRail}
            className="aw-side-icon-btn hidden lg:inline-flex"
          >
            {/* Open → arrow right (collapse panel); closed → arrow left (expand). */}
            {railOpen ? (
              <IconRailCollapse className="h-6 w-6" />
            ) : (
              <IconRailExpand className="h-6 w-6" />
            )}
          </button>
          <span aria-hidden className="aw-side-icon-rule hidden lg:block" />
        </>
      ) : null}
      {ITEMS.map((item) => {
        const selected = active === item.id;
        const Icon = ICONS[item.id];
        return (
          <div key={item.id} className="contents">
            {item.ruleBefore ? (
              <span aria-hidden className="aw-side-icon-rule" />
            ) : null}
            <button
              type="button"
              title={t(item.labelKey)}
              aria-label={t(item.labelKey)}
              aria-pressed={selected}
              data-active={selected}
              onClick={() => onSelect(item.id)}
              className="aw-side-icon-btn"
            >
              <Icon className="h-6 w-6" />
            </button>
          </div>
        );
      })}
    </nav>
  );
}
