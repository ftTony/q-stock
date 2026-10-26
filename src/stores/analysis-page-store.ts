"use client";

import { create } from "zustand";
import type {
  AnalysisBasketItem,
  AnalysisEquityType,
  AnalysisRecentItem,
  AnalysisWorkspace,
} from "@/components/analysis/types";
import {
  ANALYSIS_RECENT_KEY,
  ANALYSIS_RECENT_MAX,
} from "@/components/analysis/types";

type AnalysisPageState = {
  assetType: AnalysisEquityType;
  workspace: AnalysisWorkspace;
  industryId: string | null;
  basket: AnalysisBasketItem[];
  recent: AnalysisRecentItem[];
  sort: "changeDesc" | "changeAsc";
  setAssetType: (t: AnalysisEquityType) => void;
  setWorkspace: (w: AnalysisWorkspace) => void;
  setIndustryId: (id: string | null) => void;
  setBasket: (
    next:
      | AnalysisBasketItem[]
      | ((prev: AnalysisBasketItem[]) => AnalysisBasketItem[]),
  ) => void;
  setRecent: (
    next:
      | AnalysisRecentItem[]
      | ((prev: AnalysisRecentItem[]) => AnalysisRecentItem[]),
  ) => void;
  setSort: (s: "changeDesc" | "changeAsc") => void;
  hydrateRecent: () => void;
  pushRecent: (item: AnalysisRecentItem) => void;
};

function readRecent(): AnalysisRecentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ANALYSIS_RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AnalysisRecentItem[];
    return Array.isArray(parsed) ? parsed.slice(0, ANALYSIS_RECENT_MAX) : [];
  } catch {
    return [];
  }
}

function writeRecent(items: AnalysisRecentItem[]) {
  try {
    localStorage.setItem(ANALYSIS_RECENT_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota */
  }
}

export const useAnalysisPageStore = create<AnalysisPageState>((set, get) => ({
  assetType: "stock",
  workspace: "boards",
  industryId: null,
  basket: [],
  recent: [],
  sort: "changeDesc",
  setAssetType: (assetType) =>
    set({ assetType, workspace: "boards" }),
  setWorkspace: (workspace) => set({ workspace }),
  setIndustryId: (industryId) =>
    set({ industryId, basket: [], workspace: "boards" }),
  setBasket: (next) =>
    set({
      basket: typeof next === "function" ? next(get().basket) : next,
    }),
  setRecent: (next) =>
    set({
      recent: typeof next === "function" ? next(get().recent) : next,
    }),
  setSort: (sort) => set({ sort }),
  hydrateRecent: () => set({ recent: readRecent() }),
  pushRecent: (item) => {
    const next = [
      item,
      ...get().recent.filter(
        (r) =>
          !(r.symbol === item.symbol && r.assetType === item.assetType),
      ),
    ].slice(0, ANALYSIS_RECENT_MAX);
    writeRecent(next);
    set({ recent: next });
  },
}));
