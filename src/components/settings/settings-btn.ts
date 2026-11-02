/**
 * Settings modal action buttons — one size / weight language across tabs.
 * Pair with SubmitButton or <button>/<Link>; SubmitButton already prefixes `qt-btn`.
 * Always h-9 (36px) to match `qt-input`; CSS in globals also locks this under `.settings-ui`.
 */
export const SETTINGS_BTN =
  "box-border !h-9 !min-h-9 !max-h-9 shrink-0 !py-0 px-3.5 text-[14px] font-medium !leading-none";
export const SETTINGS_BTN_PRIMARY = `qt-btn qt-btn-primary ${SETTINGS_BTN}`;
export const SETTINGS_BTN_GHOST = `qt-btn qt-btn-ghost ${SETTINGS_BTN}`;
/** When className is merged into SubmitButton (which already adds `qt-btn`). */
export const SETTINGS_SUBMIT_PRIMARY = `qt-btn-primary ${SETTINGS_BTN}`;
export const SETTINGS_SUBMIT_GHOST = `qt-btn-ghost ${SETTINGS_BTN}`;
