"use client";

import { create } from "zustand";
import type { AssetType } from "@/lib/types";
import type { SymbolTab } from "@/components/symbol/tabs/symbol-tabs-types";
import type { StackBottomTab } from "@/components/symbol/page/symbol-stack-bottom-panel";
import type { MobileSegment } from "@/components/symbol/mobile/symbol-mobile-quick-actions";
import type { SideIconId } from "@/components/symbol/rail/symbol-side-icon-rail";

export type SymbolIdentity = {
  symbol: string;
  assetType: AssetType;
};

export type DockId = Exclude<SideIconId, "ai">;
export type TradeDockView = "desk" | "ticket";

type SymbolWorkbenchState = {
  identity: SymbolIdentity;
  tab: SymbolTab;
  stackTab: StackBottomTab;
  newsFeedTab: "news" | "press";
  mobileSegment: MobileSegment;
  aiOpen: boolean;
  seoOpen: boolean;
  dock: DockId | null;
  dockReady: boolean;
  aiReady: boolean;
  mobilePlanOpen: boolean;
  mobilePlanReady: boolean;
  tradeDockView: TradeDockView;
  boundRuleName: string | null;
  boundStrategyId: string | null;
  planFocusKey: number;
  reviewFocusKey: number;
  highlightOrderId: string | null;

  setIdentity: (identity: SymbolIdentity) => void;
  resetForIdentity: (identity: SymbolIdentity) => void;
  setTab: (tab: SymbolTab) => void;
  setStackTab: (tab: StackBottomTab) => void;
  setNewsFeedTab: (tab: "news" | "press") => void;
  setMobileSegment: (segment: MobileSegment) => void;
  setAiOpen: (open: boolean) => void;
  setSeoOpen: (open: boolean) => void;
  setDock: (dock: DockId | null) => void;
  setTradeDockView: (view: TradeDockView) => void;
  setMobilePlanOpen: (open: boolean) => void;
  setBoundStrategy: (name: string | null, id?: string | null) => void;
  openPlan: (
    isDesktop: boolean,
    setRailOpen: (open: boolean) => void,
  ) => void;
  openTrade: () => void;
  openOrderTicket: () => void;
  openTradeDesk: () => void;
  openReview: (
    orderId: string | null | undefined,
    isDesktop: boolean,
    setRailOpen: (open: boolean) => void,
  ) => void;
  closeDock: () => void;
  onMobileSegment: (
    segment: MobileSegment,
    mobileMoreTabs: { id: SymbolTab }[],
  ) => void;
  onMoreTabChange: (id: SymbolTab) => void;
  onSideSelect: (id: SideIconId) => void;
  warmDock: () => void;
  warmAi: () => void;
  warmMobilePlan: () => void;
};

const initialIdentity: SymbolIdentity = {
  symbol: "",
  assetType: "stock",
};

export const useSymbolWorkbenchStore = create<SymbolWorkbenchState>((set, get) => ({
  identity: initialIdentity,
  tab: "chart",
  stackTab: "news",
  newsFeedTab: "news",
  mobileSegment: "plan",
  aiOpen: false,
  seoOpen: false,
  dock: null,
  dockReady: false,
  aiReady: false,
  mobilePlanOpen: false,
  mobilePlanReady: false,
  tradeDockView: "desk",
  boundRuleName: null,
  boundStrategyId: null,
  planFocusKey: 0,
  reviewFocusKey: 0,
  highlightOrderId: null,

  setIdentity: (identity) => set({ identity }),
  resetForIdentity: (identity) =>
    set({
      identity,
      tab: "chart",
      stackTab: "news",
      newsFeedTab: "news",
      mobileSegment: "plan",
      aiOpen: false,
      seoOpen: false,
      dock: null,
      mobilePlanOpen: false,
      tradeDockView: "desk",
      boundRuleName: null,
      boundStrategyId: null,
      planFocusKey: 0,
      reviewFocusKey: 0,
      highlightOrderId: null,
    }),
  setTab: (tab) => set({ tab }),
  setStackTab: (stackTab) =>
    set({
      stackTab,
      ...(stackTab === "press" ||
      stackTab === "comments"
        ? { tab: stackTab as SymbolTab }
        : stackTab === "earnings" || stackTab === "profile"
          ? { tab: "fundamentals" as SymbolTab }
          : {}),
    }),
  setNewsFeedTab: (newsFeedTab) => set({ newsFeedTab }),
  setMobileSegment: (mobileSegment) => set({ mobileSegment }),
  setAiOpen: (open) =>
    set({
      aiOpen: open,
      ...(open
        ? { dock: null, seoOpen: false, mobilePlanOpen: false, aiReady: true }
        : {}),
    }),
  setSeoOpen: (open) =>
    set({
      seoOpen: open,
      ...(open
        ? { aiOpen: false, dock: null, mobilePlanOpen: false }
        : {}),
    }),
  setDock: (dock) =>
    set({
      dock,
      aiOpen: false,
      seoOpen: false,
      mobilePlanOpen: false,
      ...(dock ? { dockReady: true } : {}),
    }),
  setTradeDockView: (tradeDockView) => set({ tradeDockView }),
  setMobilePlanOpen: (open) =>
    set({
      mobilePlanOpen: open,
      ...(open
        ? { aiOpen: false, seoOpen: false, dock: null, mobilePlanReady: true }
        : {}),
    }),
  setBoundStrategy: (boundRuleName, id = null) =>
    set({ boundRuleName, boundStrategyId: id }),
  openPlan: (isDesktop, setRailOpen) => {
    set((state) => ({
      aiOpen: false,
      dock: null,
      seoOpen: false,
      mobilePlanOpen: false,
      planFocusKey: state.planFocusKey + 1,
      ...(isDesktop ? {} : { mobileSegment: "plan" as MobileSegment, tab: "chart" as SymbolTab }),
    }));
    if (isDesktop) setRailOpen(true);
  },
  openTrade: () =>
    set({
      aiOpen: false,
      seoOpen: false,
      mobilePlanOpen: false,
      tradeDockView: "ticket",
      dock: "trade",
      dockReady: true,
    }),
  openOrderTicket: () =>
    set({
      aiOpen: false,
      seoOpen: false,
      mobilePlanOpen: false,
      tradeDockView: "ticket",
      dock: "trade",
      dockReady: true,
    }),
  openTradeDesk: () =>
    set({
      aiOpen: false,
      seoOpen: false,
      mobilePlanOpen: false,
      tradeDockView: "desk",
      dock: "trade",
      dockReady: true,
    }),
  openReview: (orderId, isDesktop, setRailOpen) => {
    set((state) => ({
      aiOpen: false,
      seoOpen: false,
      dock: null,
      mobilePlanOpen: false,
      highlightOrderId: orderId ?? null,
      reviewFocusKey: state.reviewFocusKey + 1,
      ...(isDesktop ? {} : { mobileSegment: "review" as MobileSegment, tab: "chart" as SymbolTab }),
    }));
    if (isDesktop) setRailOpen(true);
  },
  closeDock: () => {
    const tab = get().tab;
    set({
      dock: null,
      ...(tab === "news" || tab === "press" || tab === "comments"
        ? { tab: "chart" as SymbolTab }
        : {}),
    });
  },
  onMobileSegment: (mobileSegment, mobileMoreTabs) =>
    set({
      aiOpen: false,
      mobilePlanOpen: false,
      dock: null,
      mobileSegment,
      ...(mobileSegment === "more"
        ? mobileMoreTabs[0]
          ? { tab: mobileMoreTabs[0].id }
          : {}
        : { tab: "chart" as SymbolTab }),
    }),
  onMoreTabChange: (tab) =>
    set({
      aiOpen: false,
      mobilePlanOpen: false,
      dock: null,
      ...(tab === "chart"
        ? { mobileSegment: "plan" as MobileSegment, tab: "chart" as SymbolTab }
        : { mobileSegment: "more" as MobileSegment, tab }),
    }),
  onSideSelect: (id) =>
    set((state) => {
      if (id === "ai") {
        return {
          aiOpen: !state.aiOpen,
          aiReady: true,
          dock: null,
          seoOpen: false,
          mobilePlanOpen: false,
        };
      }
      if (state.dock === id) {
        if (id === "trade" && state.tradeDockView === "ticket") {
          return { tradeDockView: "desk" as TradeDockView };
        }
        return { dock: null };
      }
      return {
        aiOpen: false,
        seoOpen: false,
        mobilePlanOpen: false,
        dock: id,
        dockReady: true,
        ...(id === "trade"
          ? { tradeDockView: "desk" as TradeDockView, tab: "chart" as SymbolTab }
          : id === "news"
            ? { tab: "news" as SymbolTab }
            : id === "comments"
              ? { tab: "comments" as SymbolTab }
              : state.tab === "news" ||
                  state.tab === "press" ||
                  state.tab === "comments"
                ? { tab: "chart" as SymbolTab }
                : {}),
      };
    }),
  warmDock: () => set({ dockReady: true }),
  warmAi: () => set({ aiReady: true }),
  warmMobilePlan: () => set({ mobilePlanReady: true }),
}));
