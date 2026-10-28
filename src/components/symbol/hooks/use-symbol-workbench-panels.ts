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
  const [aiReady, setAiReady] = useState(false);
  const [boundRuleName, setBoundRuleName] = useState<string | null>(null);
  const [boundStrategyId, setBoundStrategyId] = useState<string | null>(null);
  const [planFocusKey, setPlanFocusKey] = useState(0);
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

  const openTrade = useCallback(() => {
    setAiOpen(false);
    setSeoOpen(false);
    setMobilePlanOpen(false);
    setDock("trade");
  }, []);

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
        closeDock();
        return;
      }
      setAiOpen(false);
      setSeoOpen(false);
      setMobilePlanOpen(false);
      setDock(id);
      if (id === "news") setTab("news");
      else if (id === "comments") setTab("comments");
      else if (tab === "news" || tab === "press" || tab === "comments") {
        setTab("chart");
      }
    },
    [aiOpen, closeDock, dock, setTab, tab],
  );

  const sideIcon: SideIconId | null = aiOpen ? "ai" : dock;

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
    mobileSegment,
    mobilePlanOpen,
    setMobilePlanOpen,
    mobilePlanReady,
    sideIcon,
    openPlan,
    openTrade,
    onMobileSegment,
    onMoreTabChange,
    onBoundStrategyChange,
    closeDock,
    onSideSelect,
  };
}
