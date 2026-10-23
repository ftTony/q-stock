"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

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

function clampPos(left: number, top: number, w: number, h: number): Pos {
  const maxL = Math.max(EDGE, window.innerWidth - w - EDGE);
  const maxT = Math.max(EDGE, window.innerHeight - h - EDGE);
  return {
    left: Math.min(maxL, Math.max(EDGE, Math.round(left))),
    top: Math.min(maxT, Math.max(EDGE, Math.round(top))),
  };
}

/**
 * Fixed badge showing configured market-data sources in priority order.
 * Drag to reposition; position persists in localStorage.
 */
export function DataSourceBadge() {
  const t = useTranslations("common");
  const { status: sessionStatus } = useSession();
  const [chain, setChain] = useState<ProviderId[]>([]);
  const [pos, setPos] = useState<Pos | null>(null);
  const [dragging, setDragging] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const posRef = useRef<Pos | null>(null);
  posRef.current = pos;

  useEffect(() => {
    setPos(readStoredPos());
  }, []);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/health");
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as {
          providers?: Record<string, boolean>;
          providerPriority?: string[];
        };
        const configured = data.providers ?? {};
        const priority = (data.providerPriority ?? []).filter(
          (id): id is ProviderId =>
            id in PROVIDER_I18N && Boolean(configured[id]),
        );
        const ordered = priority.length
          ? priority
          : (Object.keys(PROVIDER_I18N) as ProviderId[]).filter(
              (id) => configured[id],
            );
        if (!cancelled) setChain(ordered);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionStatus]);

  // Keep stored position inside the viewport on resize.
  useEffect(() => {
    const onResize = () => {
      const current = posRef.current;
      const el = rootRef.current;
      if (!current || !el) return;
      const { width, height } = el.getBoundingClientRect();
      const next = clampPos(current.left, current.top, width, height);
      if (next.left === current.left && next.top === current.top) return;
      setPos(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
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
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
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
          : "bottom-[4.25rem] left-3 lg:bottom-3 lg:left-[272px]"
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
