/**
 * Settings modal action buttons — one size / weight language across tabs.
 * Pair with SubmitButton or <button>/<Link>; SubmitButton already prefixes `qt-btn`.
 * Primary CTAs sit at h-10 so they match field rhythm (inputs h-9) without looking like chips.
 */
export const SETTINGS_BTN =
  "h-10 shrink-0 px-5 text-[14px] font-medium leading-none";
export const SETTINGS_BTN_PRIMARY = `qt-btn qt-btn-primary !py-0 ${SETTINGS_BTN}`;
export const SETTINGS_BTN_GHOST = `qt-btn qt-btn-ghost !py-0 ${SETTINGS_BTN}`;
/** When className is merged into SubmitButton (which already adds `qt-btn`). */
export const SETTINGS_SUBMIT_PRIMARY = `qt-btn-primary !py-0 ${SETTINGS_BTN}`;
export const SETTINGS_SUBMIT_GHOST = `qt-btn-ghost !py-0 ${SETTINGS_BTN}`;
