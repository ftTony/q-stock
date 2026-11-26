# Navigation Rail Tooltips Design

## Intent

Show menu names for the compact left application navigation and right symbol-workbench tool rail, so icon-only controls are easier to discover.

## Goals

- Show a localized custom tooltip on hover and keyboard focus.
- Place the left navigation tooltip to the right and the symbol tool-rail tooltip to the left.
- Reuse existing translated labels and preserve each control's accessible name.

## Non-goals

- Change navigation, selection, or layout behavior.
- Add labels to mobile navigation or the full-width quote/plan rail.
- Add dependencies or new translation strings.

## Approaches

- Keep native `title` tooltips: no implementation work, but browser-controlled appearance and delay. Not selected.
- Add consistent custom tooltips to both icon rails: predictable placement and hover/focus behavior. Selected.

## Design

Use the existing localized labels for both rails. Render a compact, square-cornered tooltip beside the hovered or focused control, with placement chosen per rail. Match the app's flat trading-terminal chrome with a panel surface, hairline border, and no card shadow. Keep `aria-label` for assistive technology and avoid duplicate browser `title` popups. Use existing design tokens and no new dependencies.

## Constraints

The app sidebar is inside a vertically scrolling navigation region, so the tooltip must remain visible outside the narrow rail and above adjacent content. No navigation or state changes are intended.
