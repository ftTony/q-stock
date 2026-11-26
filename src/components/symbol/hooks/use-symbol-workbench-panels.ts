"use client";

import { useCallback, useEffect, useState } from "react";
import type { MobileSegment } from "@/components/symbol/mobile/symbol-mobile-quick-actions";
import type { SideIconId } from "@/components/symbol/rail/symbol-side-icon-rail";
import type { SymbolTab } from "@/components/symbol/tabs/symbol-tabs-types";

type DockId = Exclude<SideIconId, "ai">;

type Opts = {
  symbol: string;
  assetType: string;
  isDesktop: boolean;
  setRailOpen: (next: boolean | ((v: boolean) => boolean)) => void;
  setTab: (tab: SymbolTab) => void;
  tab: SymbolTab;
  mobileMoreTabs: { id: SymbolTab }[];
};

/** Dock / AI / plan / SEO panel open-close orchestration for the symbol page. */
export function useSymbolWorkbenchPanels({
  symbol,
  assetType,
  isDesktop,
  setRailOpen,
  setTab,
  tab,
  mobileMoreTabs,
}: Opts) {
  const [aiOpen, setAiOpen] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [dock, setDock] = useState<DockId | null>(null);
  const [dockReady, setDockReady] = useState(false);
  /** Trade dock: desk (持仓/订单) first; ticket = 下单票面. */
  const [tradeDockView, setTradeDockView] = useState<"desk" | "ticket">(
    "desk",
  );
  const [aiReady, setAiReady] = useState(false);
  const [boundRuleName, setBoundRuleName] = useState<string | null>(null);
  const [boundStrategyId, setBoundStrategyId] = useState<string | null>(null);
  const [planFocusKey, setPlanFocusKey] = useState(0);
  const [reviewFocusKey, setReviewFocusKey] = useState(0);
  const [highlightOrderId, setHighlightOrderId] = useState<string | null>(
    null,
  );
  const [mobileSegment, setMobileSegment] = useState<MobileSegment>("plan");
  const [mobilePlanOpen, setMobilePlanOpen] = useState(false);
  const [mobilePlanReady, setMobilePlanReady] = useState(false);

  useEffect(() => {
    setBoundRuleName(null);
    setBoundStrategyId(null);
    setDock(null);
    setAiOpen(false);
    setMobilePlanOpen(false);
    setMobileSegment("plan");
    setHighlightOrderId(null);
  }, [symbol, assetType]);

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const v = q.get("guide") ?? q.get("onboarding");
      if (v === "1" || v === "true") {
        if (isDesktop) setRailOpen(true);
        else {
          setMobileSegment("plan");
          setPlanFocusKey((k) => k + 1);
        }
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once on mount / symbol
  }, [symbol, assetType, isDesktop]);

  useEffect(() => {
    if (mobilePlanOpen) setMobilePlanReady(true);
  }, [mobilePlanOpen]);

  useEffect(() => {
    if (dock) setDockReady(true);
  }, [dock]);

  // Desktop: warm trade/news dock host so first「打开下单面板」is not a no-op.
  useEffect(() => {
    if (!isDesktop || dockReady) return;
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const warm = () => setDockReady(true);
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
  }, [isDesktop, dockReady]);

  useEffect(() => {
    if (aiOpen) setAiReady(true);
  }, [aiOpen]);

  // Desktop: mount AI drawer host immediately (side-rail click must not no-op).
  // H5: idle-warm after first paint; stub FAB handles early taps.
  useEffect(() => {
    if (aiReady) return;
    if (isDesktop) {
      setAiReady(true);
      return;
    }
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const warm = () => setAiReady(true);
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
  }, [isDesktop, aiReady]);

  const openPlan = useCallback(() => {
    setAiOpen(false);
    setDock(null);
    setPlanFocusKey((k) => k + 1);
    if (isDesktop) setRailOpen(true);
    else {
      setMobileSegment("plan");
      setTab("chart");
    }
  }, [isDesktop, setRailOpen, setTab]);

  /** Primary「交易」entry — order ticket first. */
  const openTrade = useCallback(() => {
    setAiOpen(false);
    setSeoOpen(false);
    setMobilePlanOpen(false);
    setTradeDockView("ticket");
    setDock("trade");
  }, []);

  /** Same ticket surface (desk CTA / plan「去交易」). */
  const openOrderTicket = useCallback(() => {
    setAiOpen(false);
    setSeoOpen(false);
    setMobilePlanOpen(false);
    setTradeDockView("ticket");
    setDock("trade");
  }, []);

  /** Trading desk (持仓/订单) inside the trade dock. */
  const openTradeDesk = useCallback(() => {
    setAiOpen(false);
    setSeoOpen(false);
    setMobilePlanOpen(false);
    setTradeDockView("desk");
    setDock("trade");
  }, []);

  /** Close trade chrome and focus this symbol's review rail (desktop / H5). */
  const openReview = useCallback(
    (orderId?: string | null) => {
      setAiOpen(false);
      setSeoOpen(false);
      setDock(null);
      setMobilePlanOpen(false);
      setHighlightOrderId(orderId ?? null);
      setReviewFocusKey((k) => k + 1);
      if (isDesktop) setRailOpen(true);
      else {
        setMobileSegment("review");
        setTab("chart");
      }
    },
    [isDesktop, setRailOpen, setTab],
  );

  const onMobileSegment = useCallback(
    (segment: MobileSegment) => {
      setAiOpen(false);
      setMobilePlanOpen(false);
      setDock(null);
      setMobileSegment(segment);
      if (segment === "more") {
        const first = mobileMoreTabs[0]?.id;
        if (first) setTab(first);
      } else {
        setTab("chart");
      }
    },
    [mobileMoreTabs, setTab],
  );

  const onMoreTabChange = useCallback(
    (id: SymbolTab) => {
      setAiOpen(false);
      setMobilePlanOpen(false);
      setDock(null);
      if (id === "chart") {
        setMobileSegment("plan");
        setTab("chart");
        return;
      }
      setMobileSegment("more");
      setTab(id);
    },
    [setTab],
  );

  const onBoundStrategyChange = useCallback(
    (name: string | null, id?: string | null) => {
      setBoundRuleName(name);
      setBoundStrategyId(id ?? null);
    },
    [],
  );

  const closeDock = useCallback(() => {
    setDock(null);
    if (tab === "news" || tab === "press" || tab === "comments") {
      setTab("chart");
    }
  }, [setTab, tab]);

  const onSideSelect = useCallback(
    (id: SideIconId) => {
      if (id === "ai") {
        if (aiOpen) {
          setAiOpen(false);
          return;
        }
        setDock(null);
        setMobilePlanOpen(false);
        setSeoOpen(false);
        setAiOpen(true);
        return;
      }
      if (dock === id) {
        // Ticket open + click「交易」→ switch to 交易台, don't just close.
        if (id === "trade" && tradeDockView === "ticket") {
          setTradeDockView("desk");
          return;
        }
        closeDock();
        return;
      }
      setAiOpen(false);
      setSeoOpen(false);
      setMobilePlanOpen(false);
      // Side icon「交易」= 交易台 (desk). Ticket is opened from quote / desk CTA.
      if (id === "trade") setTradeDockView("desk");
      setDock(id);
      if (id === "news") setTab("news");
      else if (id === "comments") setTab("comments");
      else if (tab === "news" || tab === "press" || tab === "comments") {
        setTab("chart");
      }
    },
    [aiOpen, closeDock, dock, setTab, tab, tradeDockView],
  );

  // Ticket dock is not the side-rail「交易台」surface — leave icon unselected.
  const sideIcon: SideIconId | null = aiOpen
    ? "ai"
    : dock === "trade" && tradeDockView === "ticket"
      ? null
      : dock;

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
