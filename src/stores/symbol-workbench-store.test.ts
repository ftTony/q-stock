import { beforeEach, describe, expect, test, vi } from "vitest";
import { useSymbolWorkbenchStore } from "./symbol-workbench-store";

describe("symbol workbench store", () => {
  beforeEach(() => {
    useSymbolWorkbenchStore
      .getState()
      .resetForIdentity({ symbol: "AAPL", assetType: "stock" });
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
});
