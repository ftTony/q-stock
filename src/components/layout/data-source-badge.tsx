"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useHealth } from "@/hooks/query/use-health";

type ProviderId =
  | "longbridge"
  | "futu"
  | "finnhub"
  | "binance"
  | "okx"
  | "fuyao";

const PROVIDER_I18N: Record<ProviderId, string> = {
  longbridge: "providerLongbridge",
  futu: "providerFutu",
  finnhub: "providerFinnhub",
  binance: "providerBinance",
  okx: "providerOkx",
  fuyao: "providerFuyao",
};

const STORAGE_KEY = "qstock.dataSourceBadgePos.v1";
const EDGE = 8;
/** Matches main shell sticky header `h-10`. */
const TOPBAR_H = 40;
/** Matches mobile bottom tab bar approx height. */
const MOBILE_TAB_H = 68;
/** Matches `SIDEBAR_WIDTH_COLLAPSED` (icon rail). */
const SIDEBAR_W = 56;

type Pos = { left: number; top: number };

function readStoredPos(): Pos | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Pos>;
    if (
      typeof parsed.left === "number" &&
      typeof parsed.top === "number" &&
      Number.isFinite(parsed.left) &&
      Number.isFinite(parsed.top)
    ) {
      return { left: parsed.left, top: parsed.top };
    }
  } catch {
    /* ignore */
  }
  return null;
}

function chromeInsets() {
  const lg = window.matchMedia("(min-width: 1024px)").matches;
  return {
    top: TOPBAR_H + EDGE,
    right: EDGE,
    bottom: lg ? EDGE : MOBILE_TAB_H + EDGE,
    left: lg ? SIDEBAR_W + EDGE : EDGE,
  };
}

function clampPos(left: number, top: number, w: number, h: number): Pos {
  const inset = chromeInsets();
  const maxL = Math.max(inset.left, window.innerWidth - w - inset.right);
  const maxT = Math.max(inset.top, window.innerHeight - h - inset.bottom);
  return {
    left: Math.min(maxL, Math.max(inset.left, Math.round(left))),
    top: Math.min(maxT, Math.max(inset.top, Math.round(top))),
  };
}

function persistPos(next: Pos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

/**
 * Fixed badge showing configured market-data sources in priority order.
 * Drag to reposition; position persists in localStorage.
 */
export function DataSourceBadge() {
  const t = useTranslations("common");
  const { status: sessionStatus } = useSession();
  const health = useHealth(sessionStatus !== "loading");
  const [pos, setPos] = useState<Pos | null>(null);
  const [dragging, setDragging] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const posRef = useRef<Pos | null>(null);
  posRef.current = pos;

  const chain = useMemo(() => {
    const data = health.data;
    if (!data) return [] as ProviderId[];
    const configured = data.providers ?? {};
    const priority = (data.providerPriority ?? []).filter(
      (id): id is ProviderId =>
        id in PROVIDER_I18N && Boolean(configured[id]),
    );
    return priority.length
      ? priority
      : (Object.keys(PROVIDER_I18N) as ProviderId[]).filter(
          (id) => configured[id],
        );
  }, [health.data]);

  // Restore + clamp away from sticky topbar / sidebar / mobile tabs.
  // Re-run when providers appear so we can measure the mounted badge.
  useEffect(() => {
    if (!chain.length) return;
    const stored = posRef.current ?? readStoredPos();
    if (!stored) return;
    const apply = () => {
      const el = rootRef.current;
      if (!el) {
        setPos(stored);
        return;
      }
      const { width, height } = el.getBoundingClientRect();
      const next = clampPos(stored.left, stored.top, width, height);
      setPos(next);
      if (next.left !== stored.left || next.top !== stored.top) {
        persistPos(next);
      }
    };
    requestAnimationFrame(apply);
  }, [chain.length]);

  // Keep stored position clear of chrome on resize.
  useEffect(() => {
    const onResize = () => {
      const current = posRef.current;
      const el = rootRef.current;
      if (!current || !el) return;
      const { width, height } = el.getBoundingClientRect();
      const next = clampPos(current.left, current.top, width, height);
      if (next.left === current.left && next.top === current.top) return;
      setPos(next);
      persistPos(next);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!chain.length) return null;

  const labels = chain.map((id) => t(PROVIDER_I18N[id]));
  const primary = labels[0];
  const title = `${t("dataSource")}: ${labels.join(" → ")}`;

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const el = rootRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const origin = posRef.current ?? { left: rect.left, top: rect.top };
    // First drag: pin current visual position before leaving CSS defaults.
    if (!posRef.current) {
      setPos(origin);
    }

    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    setDragging(true);

    el.setPointerCapture(e.pointerId);
    const prevCursor = document.body.style.cursor;
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";

    const onMove = (ev: PointerEvent) => {
      const next = clampPos(
        ev.clientX - offsetX,
        ev.clientY - offsetY,
        rect.width,
        rect.height,
      );
      setPos(next);
    };

    const onUp = (ev: PointerEvent) => {
      const next = clampPos(
        ev.clientX - offsetX,
        ev.clientY - offsetY,
        rect.width,
        rect.height,
      );
      setPos(next);
      persistPos(next);
      setDragging(false);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevUserSelect;
      try {
        el.releasePointerCapture(ev.pointerId);
      } catch {
        /* already released */
      }
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const style: CSSProperties | undefined = pos
    ? { left: pos.left, top: pos.top, right: "auto", bottom: "auto" }
    : undefined;

  return (
    <div
      ref={rootRef}
      role="status"
      title={title}
      onPointerDown={onPointerDown}
      style={style}
      data-dragging={dragging ? "true" : undefined}
      className={`fixed z-30 max-w-[min(100vw-1.5rem,20rem)] touch-none select-none ${
        pos
          ? ""
          : /* H5: sit above tab bar, clear of pinned chart mid-pane */
            "bottom-[calc(3.75rem+env(safe-area-inset-bottom,0px))] left-3 max-lg:max-w-[min(100vw-1.5rem,14rem)] lg:bottom-3 lg:left-[272px]"
      } ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
    >
      <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)]/90 px-2.5 py-1.5 text-[11px] text-[var(--muted)] shadow-sm backdrop-blur-md">
        <span className="mr-1.5 opacity-80">{t("dataSource")}</span>
        <span className="font-medium text-[var(--foreground)]">{primary}</span>
        {labels.length > 1 ? (
          <span className="ml-1 opacity-70">
            → {labels.slice(1).join(" → ")}
          </span>
        ) : null}
      </div>
    </div>
  );
}
