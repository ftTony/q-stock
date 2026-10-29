/**
 * Settings modal action buttons — one size / weight language across tabs.
 * Pair with SubmitButton or <button>/<Link>; SubmitButton already prefixes `qt-btn`.
 */
export const SETTINGS_BTN =
  "h-9 shrink-0 px-4 font-semibold leading-none";
export const SETTINGS_BTN_PRIMARY = `qt-btn qt-btn-primary ${SETTINGS_BTN}`;
export const SETTINGS_BTN_GHOST = `qt-btn qt-btn-ghost ${SETTINGS_BTN}`;
/** When className is merged into SubmitButton (which already adds `qt-btn`). */
export const SETTINGS_SUBMIT_PRIMARY = `qt-btn-primary ${SETTINGS_BTN}`;
export const SETTINGS_SUBMIT_GHOST = `qt-btn-ghost ${SETTINGS_BTN}`;
