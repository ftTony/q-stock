"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/routing";
import {
  ASSET_TYPES,
  type AssetType,
  type CandleResolution,
} from "@/lib/types";

export type MultiChartLayoutSize = 1 | 2 | 4;

export type MultiChartLeg = {
  assetType: AssetType;
  symbol: string;
};

const STORAGE_KEY = "qstock.multi-chart.v1";
const RESOLUTIONS: CandleResolution[] = ["D", "Q", "Y", "5", "1"];

type Stored = {
  layout: MultiChartLayoutSize;
  resolution: CandleResolution;
  legs: MultiChartLeg[];
};

function isAssetType(v: string): v is AssetType {
  return (ASSET_TYPES as readonly string[]).includes(v);
}

function isLayout(v: number): v is MultiChartLayoutSize {
  return v === 1 || v === 2 || v === 4;
}

function isResolution(v: string): v is CandleResolution {
  return (RESOLUTIONS as string[]).includes(v);
}

export function parseLegsParam(raw: string | null): MultiChartLeg[] {
  if (!raw?.trim()) return [];
  const out: MultiChartLeg[] = [];
  for (const part of raw.split(",")) {
    const [typeRaw, symRaw] = part.split(":");
    if (!typeRaw || !symRaw) continue;
    const assetType = typeRaw.trim().toLowerCase();
    const symbol = symRaw.trim().toUpperCase();
    if (!isAssetType(assetType) || !symbol) continue;
    out.push({ assetType, symbol });
    if (out.length >= 4) break;
  }
  return out;
}

export function serializeLegs(legs: Array<MultiChartLeg | null>): string {
  return legs
    .filter((l): l is MultiChartLeg => Boolean(l?.symbol))
    .map((l) => `${l.assetType}:${l.symbol}`)
    .join(",");
}

function padLegs(
  legs: Array<MultiChartLeg | null>,
  layout: MultiChartLayoutSize,
): Array<MultiChartLeg | null> {
  const next = legs.slice(0, layout);
  while (next.length < layout) next.push(null);
  return next;
}

function readStorage(): Stored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<Stored>;
    const layout = Number(data.layout);
    if (!isLayout(layout)) return null;
    const resolution =
      typeof data.resolution === "string" && isResolution(data.resolution)
        ? data.resolution
        : "D";
    const legs = Array.isArray(data.legs)
      ? data.legs
          .filter(
            (l): l is MultiChartLeg =>
              Boolean(l) &&
              typeof l === "object" &&
              isAssetType(String((l as MultiChartLeg).assetType)) &&
              Boolean(String((l as MultiChartLeg).symbol || "").trim()),
          )
          .map((l) => ({
            assetType: l.assetType,
            symbol: String(l.symbol).toUpperCase(),
          }))
          .slice(0, 4)
      : [];
    return { layout, resolution, legs };
  } catch {
    return null;
  }
}

function writeStorage(state: Stored) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode */
  }
}

function buildQuery(
  layout: MultiChartLayoutSize,
  resolution: CandleResolution,
  legs: Array<MultiChartLeg | null>,
): string {
  const q = new URLSearchParams();
  q.set("layout", String(layout));
  q.set("resolution", resolution);
  const legsStr = serializeLegs(legs);
  if (legsStr) q.set("legs", legsStr);
  return q.toString();
}

export function useMultiChartLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hydrated = useRef(false);

  const urlLayout = Number(searchParams.get("layout"));
  const urlRes = searchParams.get("resolution") || "";
  const urlLegs = searchParams.get("legs");
  const hasUrl =
    searchParams.has("layout") ||
    searchParams.has("resolution") ||
    searchParams.has("legs");

  const initial = useMemo(() => {
    if (hasUrl) {
      const layout = isLayout(urlLayout) ? urlLayout : 2;
      const resolution = isResolution(urlRes) ? urlRes : "D";
      return {
        layout,
        resolution,
        legs: padLegs(parseLegsParam(urlLegs), layout),
        fromUrl: true,
      };
    }
    const stored = readStorage();
    if (stored) {
      return {
        layout: stored.layout,
        resolution: stored.resolution,
        legs: padLegs(stored.legs, stored.layout),
        fromUrl: false,
      };
    }
    return {
      layout: 2 as MultiChartLayoutSize,
      resolution: "D" as CandleResolution,
      legs: padLegs([], 2),
      fromUrl: false,
    };
    // Seed once from first paint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [layout, setLayoutState] = useState<MultiChartLayoutSize>(
    initial.layout,
  );
  const [resolution, setResolutionState] = useState<CandleResolution>(
    initial.resolution,
  );
  const [legs, setLegsState] = useState<Array<MultiChartLeg | null>>(
    initial.legs,
  );

  // Persist after paint only — never call router inside setState updaters.
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      if (initial.fromUrl) return;
    }
    const qs = buildQuery(layout, resolution, legs);
    if (qs !== searchParams.toString()) {
      router.replace(`${pathname}?${qs}`, { scroll: false });
    }
    writeStorage({
      layout,
      resolution,
      legs: legs.filter((l): l is MultiChartLeg => Boolean(l)),
    });
  }, [layout, resolution, legs, pathname, router, searchParams, initial.fromUrl]);

  const setLayout = useCallback((next: MultiChartLayoutSize) => {
    setLayoutState(next);
    setLegsState((prev) => padLegs(prev, next));
  }, []);

  const setResolution = useCallback((next: CandleResolution) => {
    setResolutionState(next);
  }, []);

  const setLeg = useCallback(
    (index: number, leg: MultiChartLeg | null) => {
      setLegsState((prev) => {
        const next = [...prev];
        next[index] = leg;
        return padLegs(next, layout);
      });
    },
    [layout],
  );

  const clearLeg = useCallback(
    (index: number) => setLeg(index, null),
    [setLeg],
  );

  return {
    layout,
    resolution,
    legs,
    resolutions: RESOLUTIONS,
    setLayout,
    setResolution,
    setLeg,
    clearLeg,
  };
}
