"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { IndustryHeatmapTooltip } from "@/components/market/industry-heatmap-tooltip";
import type { IndustryHeatCell } from "@/lib/market/providers/longbridge-industry";
import { squarify, type TreemapRect } from "@/lib/market/treemap";
import type { AssetType } from "@/lib/types";

function tileColor(pct: number): string {
  if (pct > 0.02) return "var(--up)";
  if (pct < -0.02) return "var(--down)";
  return "color-mix(in srgb, var(--muted) 45%, var(--panel))";
}

function useContainerSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      setSize({ w: Math.floor(cr.width), h: Math.floor(cr.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, ...size };
}

export function IndustryHeatmap({
  assetType,
}: {
  assetType: Exclude<AssetType, "crypto">;
}) {
  const t = useTranslations("market");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [items, setItems] = useState<IndustryHeatCell[]>([]);
  const [loading, setLoading] = useState(true);
  const [degraded, setDegraded] = useState(false);
  const [hover, setHover] = useState<{
    cell: IndustryHeatCell;
    x: number;
    y: number;
  } | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { ref, w, h } = useContainerSize();

  function clearHideTimer() {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }

  function scheduleHide() {
    clearHideTimer();
    hideTimer.current = setTimeout(() => setHover(null), 120);
  }

  useEffect(() => () => clearHideTimer(), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setHover(null);
    (async () => {
      try {
        const res = await fetch(
          `/api/industry-ranks?assetType=${assetType}&limit=40`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as {
          industries?: IndustryHeatCell[];
          degraded?: boolean;
        };
        if (cancelled) return;
        setItems(data.industries ?? []);
        setDegraded(Boolean(data.degraded) || !(data.industries ?? []).length);
      } catch {
        if (!cancelled) {
          setItems([]);
          setDegraded(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [assetType]);

  const overall = useMemo(() => {
    const totalW = items.reduce((a, c) => a + Math.max(0, c.weight), 0);
    if (!items.length || totalW <= 0) return 0;
    return items.reduce(
      (a, c) => a + c.percentChange * (Math.max(0, c.weight) / totalW),
      0,
    );
  }, [items]);

  const rects: TreemapRect[] = useMemo(() => {
    if (!w || !h || !items.length) return [];
    return squarify(
      items.map((c) => ({ id: c.id, weight: c.weight, data: c })),
      w,
      h,
      2,
    );
  }, [items, w, h]);

  const overallUp = overall >= 0;

  return (
    <section className="space-y-3">
      <div className="qt-panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2.5 sm:px-4">
          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className="text-base font-semibold tracking-tight sm:text-lg">
              {t("industryAllSectors")}
            </h2>
            {!loading && items.length > 0 && (
              <span
                className={`text-sm font-semibold tabular-nums ${
                  overallUp ? "text-[var(--up)]" : "text-[var(--down)]"
                }`}
              >
                {overallUp ? "+" : ""}
                {overall.toFixed(2)}%
              </span>
            )}
          </div>
          <span className="text-xs text-[var(--muted)]">
            {loading
              ? tCommon("loading")
              : degraded
                ? t("unavailable")
                : t("industryHeatmap")}
          </span>
        </div>

        <div
          ref={ref}
          className="relative h-[360px] w-full bg-[var(--panel)] sm:h-[440px] lg:h-[520px]"
          onMouseLeave={scheduleHide}
        >
          {loading && (
            <div className="absolute inset-0 animate-pulse bg-[var(--surface-2)]" />
          )}
          {!loading && items.length === 0 && (
            <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
              {t("unavailable")}
            </div>
          )}
          {!loading &&
            rects.map((r) => {
              const cell = r.data as IndustryHeatCell;
              const up = cell.percentChange >= 0;
              const showLabel = r.w >= 52 && r.h >= 36;
              const showPct = r.w >= 40 && r.h >= 28;
              return (
                <div
                  key={r.id}
                  className="absolute flex cursor-default flex-col items-center justify-center overflow-hidden px-1 text-center text-white"
                  style={{
                    left: r.x,
                    top: r.y,
                    width: r.w,
                    height: r.h,
                    backgroundColor: tileColor(cell.percentChange),
                  }}
                  onMouseEnter={(e) => {
                    clearHideTimer();
                    setHover({ cell, x: e.clientX, y: e.clientY });
                  }}
                  onMouseMove={(e) => {
                    clearHideTimer();
                    setHover({ cell, x: e.clientX, y: e.clientY });
                  }}
                >
                  {showLabel && (
                    <div className="w-full truncate text-[11px] font-medium leading-tight sm:text-xs">
                      {cell.name}
                    </div>
                  )}
                  {showPct && (
                    <div className="mt-0.5 text-[11px] font-semibold tabular-nums sm:text-sm">
                      {up ? "+" : ""}
                      {cell.percentChange.toFixed(2)}%
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {hover && (
        <IndustryHeatmapTooltip
          cell={hover.cell}
          assetType={assetType}
          x={hover.x}
          y={hover.y}
          locale={locale}
          labels={{
            change: t("industryChange"),
            volume: t("industryVolume"),
          }}
          onEnter={clearHideTimer}
          onLeave={scheduleHide}
        />
      )}
    </section>
  );
}
