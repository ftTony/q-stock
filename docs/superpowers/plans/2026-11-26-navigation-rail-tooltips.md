# Navigation Rail Tooltips Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show localized, styled menu-name tooltips for icon-only controls in the left application sidebar and right symbol-workbench rail.

**Architecture:** Add a shared client component that portals tooltip content to `document.body`, positions it beside its anchor, and shows it on pointer hover or keyboard focus. Connect both rails to that component using their existing localized labels and accessible names.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-26-navigation-rail-tooltips-design.md`

## Global Constraints

- Reuse existing translated labels; add no translation strings.
- Keep each control's accessible name and do not change navigation behavior.
- Show the left rail tooltip on the right and the symbol tool-rail tooltip on the left.
- Use square corners, a flat panel surface, and a hairline border; do not use rounded-card styling or a shadow.
- Add no dependencies.

## Review Focus

- Long localized labels: tooltip stays within the viewport — cover in `getNavTooltipPosition` tests.
- Items near the top or bottom edge: tooltip remains vertically visible — cover in `getNavTooltipPosition` tests.
- Hover and keyboard focus: both show the same label — verify in browser.
- Pointer leaving or keyboard blur: tooltip disappears — verify in browser.
- Scrolling/resizing while a tooltip is open: tooltip closes to avoid becoming misaligned — verify in browser.

---

### Task 1: Shared icon-rail tooltip

**Files:**
- Create: `src/components/ui/nav-icon-tooltip.tsx`
- Create: `src/components/ui/nav-icon-tooltip.test.ts`
- Modify: `src/components/layout/app-sidebar.tsx`
- Modify: `src/components/symbol/rail/symbol-side-icon-rail.tsx`

**Interfaces:**
- Produces `NavIconTooltip` with props `{ label: string; side: "left" | "right"; children: ReactNode }`.
- Produces `getNavTooltipPosition(anchor: Pick<DOMRect, "top" | "left" | "right" | "height">, tooltipSize: { width: number; height: number }, viewportSize: { width: number; height: number }, side: "left" | "right"): { top: number; left: number }` for viewport-clamped fixed positioning.
- Consumes the existing localized `label` values from `RailItem` and `SymbolSideIconRail`.

- [ ] **Step 1: Add position tests**

Test `getNavTooltipPosition` for both sides, vertical centering, and clamping when an anchor is near each viewport edge.

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `npx vitest run src/components/ui/nav-icon-tooltip.test.ts`
Expected: FAIL because the position helper is not implemented.

- [ ] **Step 3: Implement the shared tooltip**

Portal a `role="tooltip"` element to `document.body`; show it while the wrapped control is hovered or focused, hide it on pointer leave or blur, and close it on window scroll or resize. Position it with the tested helper. Style it with a square corner, `--panel` surface, `--border` hairline, compact text spacing, and no shadow. Keep it non-interactive.

- [ ] **Step 4: Connect both icon rails**

Wrap the left sidebar links/buttons with `NavIconTooltip side="right"` and the right symbol rail buttons with `NavIconTooltip side="left"`. Preserve their existing `aria-label` values and remove `title` to avoid a duplicate native tooltip.

- [ ] **Step 5: Run automated checks**

Run: `npx vitest run src/components/ui/nav-icon-tooltip.test.ts`
Expected: PASS for left/right placement and viewport clamping.

Run: `npm run typecheck && npm run lint -- src/components/ui/nav-icon-tooltip.tsx src/components/ui/nav-icon-tooltip.test.ts src/components/layout/app-sidebar.tsx src/components/symbol/rail/symbol-side-icon-rail.tsx`
Expected: both commands exit 0.

- [ ] **Step 6: Verify interaction in the browser**

Hover every left and right rail icon; confirm localized names appear beside the correct rail and stay within the viewport. Tab to each icon and confirm the same tooltip appears on focus and disappears on blur. Scroll and resize while a tooltip is open and confirm it closes.

- [ ] **Step 7: Commit the verified task**

```bash
git add docs/superpowers/specs/2026-11-26-navigation-rail-tooltips-design.md docs/superpowers/plans/2026-11-26-navigation-rail-tooltips.md src/components/ui/nav-icon-tooltip.tsx src/components/ui/nav-icon-tooltip.test.ts src/components/layout/app-sidebar.tsx src/components/symbol/rail/symbol-side-icon-rail.tsx
git commit -m "feat: add navigation rail tooltips" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```
