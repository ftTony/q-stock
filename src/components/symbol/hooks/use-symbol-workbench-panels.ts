"use client";

import { useCallback, useEffect, useMemo } from "react";
import type { MobileSegment } from "@/components/symbol/mobile/symbol-mobile-quick-actions";
import type { SideIconId } from "@/components/symbol/rail/symbol-side-icon-rail";
import type { SymbolTab } from "@/components/symbol/tabs/symbol-tabs-types";
import type { AssetType } from "@/lib/types";
import { useSymbolWorkbenchStore } from "@/stores/symbol-workbench-store";

type Opts = {
  symbol: string;
  assetType: AssetType;
  isDesktop: boolean;
  setRailOpen: (next: boolean | ((v: boolean) => boolean)) => void;
  mobileMoreTabs: { id: SymbolTab }[];
};

/** Store adapter for dock, AI, plan and SEO workbench surfaces. */
export function useSymbolWorkbenchPanels({
  symbol,
  assetType,
  isDesktop,
  setRailOpen,
  mobileMoreTabs,
}: Opts) {
  const aiOpen = useSymbolWorkbenchStore((state) => state.aiOpen);
  const seoOpen = useSymbolWorkbenchStore((state) => state.seoOpen);
  const dock = useSymbolWorkbenchStore((state) => state.dock);
  const dockReady = useSymbolWorkbenchStore((state) => state.dockReady);
  const aiReady = useSymbolWorkbenchStore((state) => state.aiReady);
  const boundRuleName = useSymbolWorkbenchStore(
    (state) => state.boundRuleName,
  );
  const boundStrategyId = useSymbolWorkbenchStore(
    (state) => state.boundStrategyId,
  );
  const planFocusKey = useSymbolWorkbenchStore((state) => state.planFocusKey);
  const reviewFocusKey = useSymbolWorkbenchStore(
    (state) => state.reviewFocusKey,
  );
  const highlightOrderId = useSymbolWorkbenchStore(
    (state) => state.highlightOrderId,
  );
  const mobileSegment = useSymbolWorkbenchStore(
    (state) => state.mobileSegment,
  );
  const mobilePlanOpen = useSymbolWorkbenchStore(
    (state) => state.mobilePlanOpen,
  );
  const mobilePlanReady = useSymbolWorkbenchStore(
    (state) => state.mobilePlanReady,
  );
  const tradeDockView = useSymbolWorkbenchStore(
    (state) => state.tradeDockView,
  );
  const setAiOpen = useSymbolWorkbenchStore((state) => state.setAiOpen);
  const setSeoOpen = useSymbolWorkbenchStore((state) => state.setSeoOpen);
  const setDock = useSymbolWorkbenchStore((state) => state.setDock);
  const setMobilePlanOpen = useSymbolWorkbenchStore(
    (state) => state.setMobilePlanOpen,
  );
  const setTradeDockView = useSymbolWorkbenchStore(
    (state) => state.setTradeDockView,
  );
  const setBoundStrategy = useSymbolWorkbenchStore(
    (state) => state.setBoundStrategy,
  );
  const storeOpenPlan = useSymbolWorkbenchStore((state) => state.openPlan);
  const storeOpenTrade = useSymbolWorkbenchStore((state) => state.openTrade);
  const storeOpenOrderTicket = useSymbolWorkbenchStore(
    (state) => state.openOrderTicket,
  );
  const storeOpenTradeDesk = useSymbolWorkbenchStore(
    (state) => state.openTradeDesk,
  );
  const storeOpenReview = useSymbolWorkbenchStore((state) => state.openReview);
  const storeCloseDock = useSymbolWorkbenchStore((state) => state.closeDock);
  const storeOnMobileSegment = useSymbolWorkbenchStore(
    (state) => state.onMobileSegment,
  );
  const storeOnMoreTabChange = useSymbolWorkbenchStore(
    (state) => state.onMoreTabChange,
  );
  const storeOnSideSelect = useSymbolWorkbenchStore(
    (state) => state.onSideSelect,
  );
  const warmDock = useSymbolWorkbenchStore((state) => state.warmDock);
  const warmAi = useSymbolWorkbenchStore((state) => state.warmAi);
  const warmMobilePlan = useSymbolWorkbenchStore(
    (state) => state.warmMobilePlan,
  );

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const v = q.get("guide") ?? q.get("onboarding");
      if (v === "1" || v === "true") {
        if (isDesktop) setRailOpen(true);
        else storeOpenPlan(false, () => {});
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once on mount / symbol
  }, [symbol, assetType, isDesktop]);

  useEffect(() => {
    if (mobilePlanOpen) warmMobilePlan();
  }, [mobilePlanOpen, warmMobilePlan]);

  useEffect(() => {
    if (dock) warmDock();
  }, [dock, warmDock]);

  useEffect(() => {
    if (!isDesktop || dockReady) return;
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const warm = () => warmDock();
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(warm, { timeout: 3000 });
    } else {
      timeoutId = setTimeout(warm, 1500);
    }
    return () => {
      if (idleId != null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) clearTimeout(timeoutId);
    };
  }, [isDesktop, dockReady, warmDock]);

  useEffect(() => {
    if (aiOpen) warmAi();
  }, [aiOpen, warmAi]);

  useEffect(() => {
    if (aiReady) return;
    if (isDesktop) {
      warmAi();
      return;
    }
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const warm = () => warmAi();
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(warm, { timeout: 4000 });
    } else {
      timeoutId = setTimeout(warm, 2500);
    }
    return () => {
      if (idleId != null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) clearTimeout(timeoutId);
    };
  }, [isDesktop, aiReady, warmAi]);

  const openPlan = useCallback(() => {
    storeOpenPlan(isDesktop, (open) => setRailOpen(open));
  }, [isDesktop, setRailOpen, storeOpenPlan]);

  const openTrade = useCallback(() => {
    storeOpenTrade();
  }, [storeOpenTrade]);

  const openOrderTicket = useCallback(() => {
    storeOpenOrderTicket();
  }, [storeOpenOrderTicket]);

  const openTradeDesk = useCallback(() => {
    storeOpenTradeDesk();
  }, [storeOpenTradeDesk]);

  const openReview = useCallback(
    (orderId?: string | null) => {
      storeOpenReview(orderId, isDesktop, (open) => setRailOpen(open));
    },
    [isDesktop, setRailOpen, storeOpenReview],
  );

  const onMobileSegment = useCallback(
    (segment: MobileSegment) =>
      storeOnMobileSegment(segment, mobileMoreTabs),
    [mobileMoreTabs, storeOnMobileSegment],
  );

  const onMoreTabChange = useCallback(
    (id: SymbolTab) => storeOnMoreTabChange(id),
    [storeOnMoreTabChange],
  );

  const onBoundStrategyChange = useCallback(
    (name: string | null, id?: string | null) =>
      setBoundStrategy(name, id),
    [setBoundStrategy],
  );

  const closeDock = storeCloseDock;
  const onSideSelect = storeOnSideSelect;

  const sideIcon: SideIconId | null = useMemo(
    () =>
      aiOpen
        ? "ai"
        : dock === "trade" && tradeDockView === "ticket"
          ? null
          : dock,
    [aiOpen, dock, tradeDockView],
  );

  return {
    aiOpen,
    setAiOpen,
    seoOpen,
    setSeoOpen,
    dock,
    setDock,
    dockReady,
    aiReady,
    boundRuleName,
    boundStrategyId,
    planFocusKey,
    reviewFocusKey,
    highlightOrderId,
    mobileSegment,
    mobilePlanOpen,
    setMobilePlanOpen,
    mobilePlanReady,
    sideIcon,
    openPlan,
    openTrade,
    openOrderTicket,
    openTradeDesk,
    tradeDockView,
    setTradeDockView,
    openReview,
    onMobileSegment,
    onMoreTabChange,
    onBoundStrategyChange,
    closeDock,
    onSideSelect,
  };
}
