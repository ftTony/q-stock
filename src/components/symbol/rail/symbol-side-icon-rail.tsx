"use client";

import { useTranslations } from "next-intl";
import {
  IconRailCollapse,
  IconRailExpand,
} from "@/components/symbol/watchlist/watchlist-toggle-icons";
import "../styles/apple-workbench.css";

export type SideIconId = "ai" | "trade" | "news" | "comments";

type Props = {
  /** Currently open tool; null when none. */
  active: SideIconId | null;
  onSelect: (id: SideIconId) => void;
  /** Right quote/plan rail open — toggle lives on this far-right strip. */
  railOpen?: boolean;
  onToggleRail?: () => void;
  /** Hide news/press entry when layout prefs turn the module off. */
  showNews?: boolean;
};

const SW = 1.75;
/** Shared glyph box so every icon reads the same optical width. */
const glyph = "h-5 w-5 shrink-0";

/** Trade — chart in square. */
function IconTrade({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="5"
        y="5"
        width="14"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path
        d="M8 15l2.8-3 2 2L16.5 9"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** News — document (centered in 24 box). */
function IconNews({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7.5 5h7.5l2.5 2.5V19a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <path
        d="M15 5v2.5h2.5M9.5 11h5M9.5 14h5M9.5 17h3"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Comments — single bubble (same footprint as others). */
function IconComments({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.5 6.5h11A2 2 0 0 1 19.5 8.5v6a2 2 0 0 1-2 2H12l-3.5 3v-3H6.5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** AI — robot head, centered. */
function IconAi({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.5v2"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinecap="round"
      />
      <circle cx="12" cy="2.75" r="0.9" fill="currentColor" />
      <rect
        x="5.5"
        y="6.5"
        width="13"
        height="9.5"
        rx="2.5"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <circle cx="9.25" cy="11" r="1.1" fill="currentColor" />
      <circle cx="14.75" cy="11" r="1.1" fill="currentColor" />
      <path
        d="M9.5 14h5"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinecap="round"
      />
      <path
        d="M9.25 16v1.75A1.5 1.5 0 0 0 10.75 19.25h2.5A1.5 1.5 0 0 0 14.75 17.75V16"
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
  showNews = true,
}: Props) {
  const t = useTranslations("symbol");
  const items = showNews ? ITEMS : ITEMS.filter((item) => item.id !== "news");

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
            data-rail-toggle="true"
            className="aw-side-icon-btn hidden lg:inline-flex"
          >
            {railOpen ? (
              <IconRailCollapse className={glyph} />
            ) : (
              <IconRailExpand className={glyph} />
            )}
          </button>
          <span aria-hidden className="aw-side-icon-rule hidden lg:block" />
        </>
      ) : null}
      {items.map((item) => {
        const selected = active === item.id;
        const Icon = ICONS[item.id];
        return (
          <div key={item.id} className="contents">
            {item.ruleBefore && showNews ? (
              <span aria-hidden className="aw-side-icon-rule" />
            ) : null}
            <button
              type="button"
              title={t(item.labelKey)}
              aria-label={t(item.labelKey)}
              aria-pressed={selected}
              data-active={selected}
              data-tour={item.id === "trade" ? "rail-order" : undefined}
              onClick={() => onSelect(item.id)}
              className="aw-side-icon-btn"
            >
              <Icon className={glyph} />
            </button>
          </div>
        );
      })}
    </nav>
  );
}
