/** Shared spotlight visuals — readable in both light and dark themes. */

/** Dim the page; pure black so it still reads on dark navy UI. */
export const SPOTLIGHT_SCRIM = "rgba(0, 0, 0, 0.78)";

/** Hole cutout + brand halo (box-shadow spreads past the element). */
export function spotlightHoleShadow(): string {
  return [
    "0 0 0 2px var(--brand)",
    "0 0 0 7px color-mix(in srgb, var(--brand) 40%, transparent)",
    `0 0 0 9999px ${SPOTLIGHT_SCRIM}`,
  ].join(", ");
}

/**
 * Tip always uses a light elevated surface so it stays clear on dark UI
 * (same pattern as most product tours over a scrim).
 */
export const spotlightTipClassName =
  "absolute z-[91] rounded-xl border-2 border-[var(--brand)] " +
  "bg-[#f4f7fb] p-3.5 text-[#0b1220] " +
  "shadow-[0_18px_50px_rgba(0,0,0,0.65)]";

export const spotlightTipMutedClassName = "text-[#5b6b82]";
export const spotlightTipTitleClassName =
  "mt-1 text-[14px] font-semibold text-[#0b1220]";
export const spotlightTipBodyClassName =
  "mt-1 text-[12px] leading-relaxed text-[#5b6b82]";
export const spotlightTipDismissClassName =
  "text-[12px] text-[#5b6b82] hover:text-[#0b1220]";
