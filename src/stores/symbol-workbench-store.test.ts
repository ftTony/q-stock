import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  DEFAULT_SYMBOL_LAYOUT,
  SYMBOL_LAYOUT_KEY,
  useSymbolWorkbenchStore,
} from "./symbol-workbench-store";

describe("symbol workbench store", () => {
  let storage: Map<string, string>;

  beforeEach(() => {
    storage = new Map();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
        clear: () => storage.clear(),
      },
    });
    useSymbolWorkbenchStore
      .getState()
      .resetForIdentity({ symbol: "AAPL", assetType: "stock" });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("resetForIdentity resets workspace state for a new symbol or asset", () => {
    const store = useSymbolWorkbenchStore.getState();
    store.setAiOpen(true);
    store.setSeoOpen(true);
    store.openTradeDesk();
    store.setBoundStrategy("Risk rule", "strategy-1");
    store.setTab("fundamentals");

    useSymbolWorkbenchStore
      .getState()
      .resetForIdentity({ symbol: "MSFT", assetType: "stock" });

    expect(useSymbolWorkbenchStore.getState()).toMatchObject({
      identity: { symbol: "MSFT", assetType: "stock" },
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
    });

    useSymbolWorkbenchStore
      .getState()
      .resetForIdentity({ symbol: "700", assetType: "hk" });
    expect(useSymbolWorkbenchStore.getState().identity).toEqual({
      symbol: "700",
      assetType: "hk",
    });
  });

  test("trade and review actions apply surface mutual exclusivity", () => {
    const store = useSymbolWorkbenchStore.getState();
    store.setAiOpen(true);
    store.setSeoOpen(true);

    useSymbolWorkbenchStore.getState().openTrade();
    expect(useSymbolWorkbenchStore.getState()).toMatchObject({
      dock: "trade",
      tradeDockView: "ticket",
      aiOpen: false,
      seoOpen: false,
      mobilePlanOpen: false,
    });

    useSymbolWorkbenchStore.getState().openTradeDesk();
    expect(useSymbolWorkbenchStore.getState()).toMatchObject({
      dock: "trade",
      tradeDockView: "desk",
      aiOpen: false,
      seoOpen: false,
      mobilePlanOpen: false,
    });

    const setRailOpen = vi.fn();
    useSymbolWorkbenchStore
      .getState()
      .openReview("O-1", true, setRailOpen);
    expect(useSymbolWorkbenchStore.getState()).toMatchObject({
      dock: null,
      aiOpen: false,
      seoOpen: false,
      mobilePlanOpen: false,
      highlightOrderId: "O-1",
    });
    expect(useSymbolWorkbenchStore.getState().reviewFocusKey).toBe(1);
    expect(setRailOpen).toHaveBeenCalledWith(true);
  });

  test("mobile and side rail actions update the correct navigation state", () => {
    useSymbolWorkbenchStore
      .getState()
      .onMobileSegment("more", [{ id: "fundamentals" }]);
    expect(useSymbolWorkbenchStore.getState()).toMatchObject({
      mobileSegment: "more",
      tab: "fundamentals",
    });

    useSymbolWorkbenchStore.getState().onMoreTabChange("chart");
    expect(useSymbolWorkbenchStore.getState()).toMatchObject({
      mobileSegment: "plan",
      tab: "chart",
    });

    useSymbolWorkbenchStore.getState().onSideSelect("ai");
    expect(useSymbolWorkbenchStore.getState().aiOpen).toBe(true);
    expect(useSymbolWorkbenchStore.getState().dock).toBeNull();

    useSymbolWorkbenchStore.getState().onSideSelect("trade");
    expect(useSymbolWorkbenchStore.getState()).toMatchObject({
      aiOpen: false,
      dock: "trade",
      tradeDockView: "desk",
      tab: "chart",
    });
  });

  test("hydrateLayout restores the persisted layout and modules", () => {
      storage.set(
        SYMBOL_LAYOUT_KEY,
        JSON.stringify({
          layoutMode: "stack",
          modules: {
            watchlist: true,
            rail: false,
            chart: true,
            newsDock: false,
          },
        }),
      );

      useSymbolWorkbenchStore.getState().hydrateLayout();

      expect(useSymbolWorkbenchStore.getState()).toMatchObject({
        layoutMode: "stack",
        modules: {
          watchlist: true,
          rail: false,
          chart: true,
          newsDock: false,
        },
        layoutReady: true,
      });
  });

  test("hydrateLayout migrates legacy module visibility", () => {
      storage.set("qstock.symbolWatchlistOpen.v1", "1");
      storage.set("qstock.symbolRailOpen.v1", "0");

      useSymbolWorkbenchStore.getState().hydrateLayout();

      expect(useSymbolWorkbenchStore.getState()).toMatchObject({
        layoutMode: "side",
        modules: {
          watchlist: true,
          rail: false,
          chart: true,
          newsDock: true,
        },
        layoutReady: true,
      });
  });

  test("layout changes persist complete preferences and reset defaults", () => {
      useSymbolWorkbenchStore.getState().hydrateLayout();
      useSymbolWorkbenchStore.getState().setLayoutModule("rail", false);

      expect(JSON.parse(storage.get(SYMBOL_LAYOUT_KEY) ?? "null")).toEqual({
        layoutMode: "side",
        modules: {
          watchlist: false,
          rail: false,
          chart: true,
          newsDock: true,
        },
      });

      useSymbolWorkbenchStore
        .getState()
        .resetForIdentity({ symbol: "MSFT", assetType: "stock" });
      expect(useSymbolWorkbenchStore.getState().modules.rail).toBe(false);

      useSymbolWorkbenchStore.getState().resetLayout();
      expect(useSymbolWorkbenchStore.getState()).toMatchObject({
        layoutMode: DEFAULT_SYMBOL_LAYOUT.layoutMode,
        modules: DEFAULT_SYMBOL_LAYOUT.modules,
      });
      expect(JSON.parse(storage.get(SYMBOL_LAYOUT_KEY) ?? "null")).toEqual(
        DEFAULT_SYMBOL_LAYOUT,
      );
  });

  test("navigation keeps stack tab, page tab, and news feed in sync", () => {
    const store = useSymbolWorkbenchStore.getState();
    store.setStackTab("earnings");
    expect(useSymbolWorkbenchStore.getState()).toMatchObject({
      stackTab: "earnings",
      tab: "fundamentals",
    });

    useSymbolWorkbenchStore.getState().setStackTab("press");
    expect(useSymbolWorkbenchStore.getState()).toMatchObject({
      stackTab: "press",
      tab: "press",
      newsFeedTab: "press",
    });

    useSymbolWorkbenchStore.getState().setStackTab("profile");
    expect(useSymbolWorkbenchStore.getState()).toMatchObject({
      stackTab: "profile",
      tab: "fundamentals",
    });

    useSymbolWorkbenchStore.getState().setDock("news");
    useSymbolWorkbenchStore.getState().setTab("news");
    expect(useSymbolWorkbenchStore.getState()).toMatchObject({
      dock: "news",
      tab: "news",
      newsFeedTab: "news",
    });
    useSymbolWorkbenchStore.getState().closeDock();
    expect(useSymbolWorkbenchStore.getState()).toMatchObject({
      dock: null,
      tab: "chart",
    });
  });
});
