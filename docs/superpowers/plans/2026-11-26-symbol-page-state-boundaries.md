# Symbol Page State Boundaries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralize cross-component symbol workbench UI state in a typed Zustand store while keeping server data in React Query and domain hooks.

**Architecture:** Add a symbol-scoped Zustand store for identity, layout, navigation, surfaces, and focus. Keep `useSymbolPage` responsible for quote/tab server data and mutations, migrate panel orchestration and layout preferences onto store selectors/actions, then reduce `SymbolPageClient` and `SymbolWorkbenchBody` to composition and adapters.

**Tech Stack:** Next.js 15, React 19, TypeScript, Zustand, TanStack Query, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-26-symbol-page-state-boundaries-design.md`

## Global Constraints

- 页面状态必须按 `assetType + symbol` 隔离；切换身份时旧 surface、focus 和导航状态不得残留。
- React Query continues to own quote, candle, news, earnings, comments, watchlist and mutation data.
- Layout persistence remains on `qstock.symbolLayout.v2`; legacy watchlist/rail open keys remain readable for one-time migration.
- Desktop/stack/mobile behavior must preserve the existing side, stack, AI, SEO, Dock, plan, review and trading interactions.
- Components must use Zustand selectors; no one selector that returns the whole store should be used in a hot quote or chart render path.
- Existing SSR/SEO route behavior must remain unchanged.

## Review Focus

- Switching from one symbol to another while an overlay is open must close it and reset its focus token, covered in the store identity reset test.
- Switching asset types must not reuse trade, SEO or mobile plan state, covered in the store identity reset test.
- Repeatedly opening and closing the same Dock must preserve the existing mutually exclusive surface rules, covered in the surface action tests.
- Opening plan/review must retain or activate the desktop rail and use the mobile chart segment, covered in the surface action tests.
- Restoring layout must honor persisted module booleans and reset all modules to defaults, covered in the layout hydration/reset tests.

---

### Task 1: Add the Symbol Workbench Store

**Files:**
- Create: `src/stores/symbol-workbench-store.ts`
- Create: `src/stores/symbol-workbench-store.test.ts`

**Interfaces:**
- Consumes: `AssetType` from `src/lib/types.ts`; `SymbolTab` from `src/components/symbol/tabs/symbol-tabs-types.ts`; `StackBottomTab` from `src/components/symbol/page/symbol-stack-bottom-panel.tsx`; `MobileSegment` from `src/components/symbol/mobile/symbol-mobile-quick-actions.tsx`; `SideIconId` from `src/components/symbol/rail/symbol-side-icon-rail.tsx`.
- Produces:

```ts
type SymbolIdentity = { symbol: string; assetType: AssetType };
type DockId = Exclude<SideIconId, "ai">;
type TradeDockView = "desk" | "ticket";

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
};
```

Define store actions with these exact names:

```ts
setIdentity(identity: SymbolIdentity): void
resetForIdentity(identity: SymbolIdentity): void
setTab(tab: SymbolTab): void
setStackTab(tab: StackBottomTab): void
setNewsFeedTab(tab: "news" | "press"): void
setMobileSegment(segment: MobileSegment): void
setAiOpen(open: boolean): void
setSeoOpen(open: boolean): void
setDock(dock: DockId | null): void
setTradeDockView(view: TradeDockView): void
setMobilePlanOpen(open: boolean): void
setBoundStrategy(name: string | null, id?: string | null): void
openPlan(isDesktop: boolean, setRailOpen: (open: boolean) => void): void
openTrade(): void
openOrderTicket(): void
openTradeDesk(): void
openReview(orderId: string | null | undefined, isDesktop: boolean, setRailOpen: (open: boolean) => void): void
closeDock(): void
onMobileSegment(segment: MobileSegment, mobileMoreTabs: { id: SymbolTab }[]): void
onMoreTabChange(id: SymbolTab): void
onSideSelect(id: SideIconId): void
warmDock(): void
warmAi(): void
warmMobilePlan(): void
```

- [ ] **Step 1: Write failing store tests**

In `src/stores/symbol-workbench-store.test.ts`, reset the store before each test and assert:
- `resetForIdentity({symbol:"AAPL",assetType:"stock"})` updates identity and leaves all surfaces closed, focus keys at zero, mobile segment at `"plan"`, and tab at `"chart"`.
- Changing only `symbol` or `assetType` produces the same reset behavior.
- `openTrade()` sets dock to `"trade"` and trade view to `"ticket"` while closing AI, SEO and mobile plan.
- `openTradeDesk()` sets dock to `"trade"` and trade view to `"desk"`.
- `openReview("O-1", true, setRailOpen)` closes surfaces, sets highlight order to `"O-1"`, increments review focus once, and calls `setRailOpen(true)`.
- `onMobileSegment("more", [{id:"fundamentals"}])` sets mobile segment to `"more"` and tab to `"fundamentals"`.
- `onMoreTabChange("chart")` sets mobile segment to `"plan"` and tab to `"chart"`.
- `onSideSelect("ai")` toggles AI and closes Dock/SEO/mobile plan; `onSideSelect("trade")` opens a trade desk and sets tab to chart.

- [ ] **Step 2: Run store tests and verify they fail**

Run: `npx vitest run src/stores/symbol-workbench-store.test.ts`
Expected: FAIL because `symbol-workbench-store` and the tested exports do not exist.

- [ ] **Step 3: Implement the store**

Create `src/stores/symbol-workbench-store.ts` with the exact state/actions above. Implement a per-symbol reset in `resetForIdentity` and implement surface mutual exclusivity inside `openPlan`, `openTrade`, `openTradeDesk`, `openReview`, `setAiOpen`, `setSeoOpen`, `setDock`, `onSideSelect`, `onMobileSegment`, and `onMoreTabChange`.

- [ ] **Step 4: Run store tests and verify they pass**

Run: `npx vitest run src/stores/symbol-workbench-store.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit the store foundation**

```bash
git add src/stores/symbol-workbench-store.ts src/stores/symbol-workbench-store.test.ts
git commit -m "feat: add symbol workbench state store"
```

### Task 2: Centralize Layout Preferences in the Store

**Files:**
- Modify: `src/stores/symbol-workbench-store.ts`
- Modify: `src/stores/symbol-workbench-store.test.ts`
- Modify: `src/components/symbol/hooks/use-symbol-layout-prefs.ts`

**Interfaces:**
- Consumes: `SYMBOL_LAYOUT_KEY`, legacy open keys and `DEFAULT_SYMBOL_LAYOUT` behavior from `use-symbol-layout-prefs.ts`.
- Produces store fields:

```ts
layoutMode: "side" | "stack";
modules: {
  watchlist: boolean;
  rail: boolean;
  chart: boolean;
  newsDock: boolean;
};
layoutReady: boolean;
```

Produce/store actions:

```ts
hydrateLayout(): void
setLayoutMode(layoutMode: "side" | "stack"): void
setLayoutModule(key: "watchlist" | "rail" | "chart" | "newsDock", value: boolean): void
resetLayout(): void
```

- [ ] **Step 1: Write failing layout tests**

In `src/stores/symbol-workbench-store.test.ts`, assert:
- Node environment has no `window.localStorage`; install a minimal in-memory `Storage` mock in `beforeEach` and restore it in `afterEach`.
- `hydrateLayout()` restores `{layoutMode:"stack",modules:{watchlist:true,rail:false,chart:true,newsDock:false}}` from a valid `SYMBOL_LAYOUT_KEY` value.
- `hydrateLayout()` falls back to legacy watchlist/rail keys when the new key is absent.
- `setLayoutModule("rail", false)` updates only rail and persists the complete prefs object.
- `resetLayout()` restores `DEFAULT_SYMBOL_LAYOUT` and persists it.

- [ ] **Step 2: Run tests and verify they fail**

Run: `npx vitest run src/stores/symbol-workbench-store.test.ts`
Expected: FAIL on missing layout fields/actions.

- [ ] **Step 3: Implement layout in the store**

Move `readPrefs`, `writePrefs`, `DEFAULT_SYMBOL_LAYOUT`, layout types and the legacy key compatibility logic into the store module or export-compatible helpers. Change `useSymbolLayoutPrefs` to selectors over `useSymbolWorkbenchStore` and retain the existing `prefs`, `ready`, `setLayoutMode`, `setModule`, `resetLayout` return shape for compatibility.

- [ ] **Step 4: Run tests and verify they pass**

Run: `npx vitest run src/stores/symbol-workbench-store.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit layout centralization**

```bash
git add src/stores/symbol-workbench-store.ts src/stores/symbol-workbench-store.test.ts src/components/symbol/hooks/use-symbol-layout-prefs.ts
git commit -m "refactor: centralize symbol layout preferences"
```

### Task 3: Replace Panel Hook State with Store Actions

**Files:**
- Modify: `src/components/symbol/hooks/use-symbol-workbench-panels.ts`
- Modify: `src/components/symbol/symbol-page-client.tsx`
- Modify: `src/components/symbol/page/symbol-workbench-body.tsx`

**Interfaces:**
- Consumes `useSymbolWorkbenchStore` and the existing `setRailOpen` callback.
- Produces the compatibility object returned by `useSymbolWorkbenchPanels` unchanged in shape:

```ts
{
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
  tradeDockView,
  setTradeDockView,
  sideIcon,
  openPlan,
  openTrade,
  openOrderTicket,
  openTradeDesk,
  openReview,
  onMobileSegment,
  onMoreTabChange,
  onBoundStrategyChange,
  closeDock,
  onSideSelect
}
```

- [ ] **Step 1: Add migration-focused tests**

Create tests around the store actions already added in Task 1. Add no component snapshot tests; assert that the compatibility hook returns store-backed values and delegates open/close calls to the store.

- [ ] **Step 2: Replace local panel state**

Remove all `useState` calls for AI, SEO, Dock, trade view, ready flags, strategy binding, focus tokens, mobile segment and mobile plan from `useSymbolWorkbenchPanels`. Keep the Hook only as a selector/adapter plus warm effects and URL `guide/onboarding` handling.

- [ ] **Step 3: Migrate page callbacks**

Change `SymbolPageClient` to call store actions for `openPlan`, `openTrade`, `openOrderTicket`, open-review and `onOpenAbout` behavior. Keep quote-derived callbacks and chart callbacks in `useSymbolPage`.

- [ ] **Step 4: Verify the targeted suite**

Run: `npx vitest run src/stores/symbol-workbench-store.test.ts`
Expected: PASS. Run `npm run typecheck`, expected to pass for the migrated compatibility shape.

- [ ] **Step 5: Commit panel orchestration migration**

```bash
git add src/components/symbol/hooks/use-symbol-workbench-panels.ts src/components/symbol/symbol-page-client.tsx src/components/symbol/page/symbol-workbench-body.tsx src/stores/symbol-workbench-store.ts src/stores/symbol-workbench-store.test.ts
git commit -m "refactor: move symbol panel orchestration to store"
```

### Task 4: Move Tab and Stack Navigation into the Store

**Files:**
- Modify: `src/stores/symbol-workbench-store.ts`
- Modify: `src/components/symbol/hooks/use-symbol-page.ts`
- Modify: `src/components/symbol/symbol-page-client.tsx`
- Modify: `src/components/symbol/page/symbol-workbench-body.tsx`

**Interfaces:**
- Store owns `tab`, `stackTab`, `newsFeedTab`, and `setTab`.
- `useSymbolPage` no longer declares `tab` with `useState`; it selects `tab` and `setTab` from `useSymbolWorkbenchStore`.
- `SymbolPageClient` selects stack and news navigation from the store through existing props or direct store selectors.

- [ ] **Step 1: Write navigation store tests**

In `src/stores/symbol-workbench-store.test.ts`, assert:
- `setStackTab("earnings")` updates stack tab and not page tab; `setStackTab("press")` updates stack tab and sets page tab to `"press"`.
- `setStackTab("profile")` sets page tab to `"fundamentals"`.
- `setTab("news")` updates page tab and closes a news/press/comment tab only when `closeDock()` is called.
- `resetForIdentity` restores page tab `"chart"`, stack tab `"news"` and news feed `"news"`.

- [ ] **Step 2: Run tests and verify they fail**

Run: `npx vitest run src/stores/symbol-workbench-store.test.ts`
Expected: FAIL on missing navigation behavior.

- [ ] **Step 3: Move navigation state**

Add the navigation rules to the store and remove the corresponding `useState` declarations from `useSymbolPage` and `SymbolPageClient`. Keep `useSymbolTabData` calls and tab loading behavior unchanged.

- [ ] **Step 4: Run verification**

Run: `npx vitest run src/stores/symbol-workbench-store.test.ts && npm run typecheck`
Expected: Navigation tests and typecheck pass.

- [ ] **Step 5: Commit navigation centralization**

```bash
git add src/stores/symbol-workbench-store.ts src/stores/symbol-workbench-store.test.ts src/components/symbol/hooks/use-symbol-page.ts src/components/symbol/symbol-page-client.tsx src/components/symbol/page/symbol-workbench-body.tsx
git commit -m "refactor: centralize symbol navigation state"
```

### Task 5: Thin the Page Client and Verify the Workbench

**Files:**
- Modify: `src/components/symbol/symbol-page-client.tsx`
- Modify: `src/components/symbol/page/symbol-workbench-body.tsx`
- Modify: `src/components/symbol/hooks/use-symbol-workbench-panels.ts`
- Modify: `src/stores/symbol-workbench-store.ts`

**Interfaces:**
- `SymbolPageClient` owns no panel/Dock/AI/SEO/stack/mobile `useState`.
- `SymbolWorkbenchBody` continues to receive section props but no duplicate open/close callback implementations.
- Store is the only source for cross-component workbench state.

- [ ] **Step 1: Remove remaining orchestration state**

Search `symbol-page-client.tsx`, `symbol-workbench-body.tsx`, and `use-symbol-workbench-panels.ts` for panel `useState`, duplicated close checks and direct surface booleans. Replace each with a store selector or store action.

- [ ] **Step 2: Add identity synchronization**

In `SymbolPageClient`, detect symbol/asset identity changes and call `resetForIdentity({symbol, assetType})` before effects derive layout or panel state. Preserve chart mount behavior and avoid resetting on initial mount.

- [ ] **Step 3: Run lint and typecheck**

Run: `npm run lint -- src/components/symbol/symbol-page-client.tsx src/components/symbol/page/symbol-workbench-body.tsx src/components/symbol/hooks/use-symbol-workbench-panels.ts src/stores/symbol-workbench-store.ts`
Expected: PASS.

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Run targeted and full unit tests**

Run: `npx vitest run src/stores/symbol-workbench-store.test.ts`
Expected: PASS.

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit the final integration**

```bash
git add src/components/symbol/symbol-page-client.tsx src/components/symbol/page/symbol-workbench-body.tsx src/components/symbol/hooks/use-symbol-workbench-panels.ts src/stores/symbol-workbench-store.ts
git commit -m "refactor: complete symbol workbench state split"
```
