"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  SETTINGS_BTN_GHOST,
  SETTINGS_SUBMIT_PRIMARY,
} from "@/components/settings/settings-btn";
import { SettingsHint } from "@/components/settings/settings-hint";
import { PinBoxes } from "@/components/trading/pin-boxes";
import { TradePasswordDialog } from "@/components/trading/trade-password-dialog";
import { useFlashMessage } from "@/components/settings/use-flash-message";
import {
  useDisableTradePassword,
  useResetTradePassword,
  useSetTradePassword,
  useTradePasswordStatus,
  useVerifyLoginPassword,
} from "@/hooks/query/use-trading";
import { TRADE_PIN_LENGTH } from "@/lib/trading/trade-password";

type Mode = "set" | "change" | "disable";

/** Settings form for the optional 6-digit trade password. */
export function TradePasswordSettingsForm() {
  const t = useTranslations("tradePassword");
  const tCommon = useTranslations("common");
  const statusQuery = useTradePasswordStatus();
  const setMut = useSetTradePassword();
  const disableMut = useDisableTradePassword();
  const resetMut = useResetTradePassword();
  const verifyMut = useVerifyLoginPassword();
  const { message, messageKind, flash, clearFlash } = useFlashMessage();

  const enabled = Boolean(statusQuery.data?.enabled);
  const [mode, setMode] = useState<Mode | null>(null);
  const [pin, setPin] = useState("");
  const [confirmPin, setPinConfirm] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const ready = statusQuery.data != null;

  function reset() {
    setMode(null);
    setPin("");
    setPinConfirm("");
    setCurrentPin("");
  }

  const fieldLabel = "mb-1.5 block text-[12px] text-[var(--muted)]";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    clearFlash();
    if (pin.length !== TRADE_PIN_LENGTH) {
      flash("error", t("errLength"));
      return;
    }
    if (mode === "set" && pin !== confirmPin) {
      flash("error", t("errMismatch"));
      return;
    }
    try {
      if (mode === "disable") {
        await disableMut.mutateAsync(pin);
        flash("ok", t("disabled"));
      } else {
        await setMut.mutateAsync({
          pin,
          ...(mode === "change" ? { currentPin } : {}),
        });
        flash("ok", mode === "change" ? t("changed") : t("created"));
      }
      reset();
    } catch (err) {
      const code = (err as Error & { code?: string }).code;
      flash(
        "error",
        code === "INVALID_CURRENT_PIN"
          ? t("errCurrent")
          : err instanceof Error
            ? err.message
            : t("saveFailed"),
      );
    }
  }

  // Forgot-PIN reset runs inside the dialog; errors surface there.
  // Step 1 verifies the login password; step 2 persists the new PIN.
  async function onVerifyLogin(loginPassword: string) {
    setForgotError(null);
    try {
      await verifyMut.mutateAsync(loginPassword);
    } catch (err) {
      const code = (err as Error & { code?: string }).code;
      setForgotError(
        code === "INVALID_LOGIN_PASSWORD"
          ? t("errLoginPassword")
          : code === "NO_LOGIN_PASSWORD"
            ? t("errNoLoginPassword")
            : err instanceof Error
              ? err.message
              : t("saveFailed"),
      );
      throw err;
    }
  }

  async function onForgotSubmit(pin: string, loginPassword?: string) {
    setForgotError(null);
    try {
      await resetMut.mutateAsync({ loginPassword: loginPassword ?? "", pin });
      setForgotOpen(false);
      setForgotError(null);
      flash("ok", t("resetDone"));
    } catch (err) {
      const code = (err as Error & { code?: string }).code;
      setForgotError(
        code === "INVALID_LOGIN_PASSWORD"
          ? t("errLoginPassword")
          : err instanceof Error
            ? err.message
            : t("saveFailed"),
      );
    }
  }

  const busy = setMut.isPending || disableMut.isPending;

  return (
    <section className="border-t border-[var(--aw-hairline,var(--border))] pt-4">
      <div className="pb-1">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[15px] font-semibold tracking-[-0.2px]">
            {t("title")}
          </h2>
          <span
            className={`inline-flex items-center gap-1.5 text-[12px] ${
              enabled ? "text-[var(--up)]" : "text-[var(--muted)]"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                enabled ? "bg-[var(--up)]" : "bg-[var(--muted)]"
              }`}
            />
            {enabled ? t("statusOn") : t("statusOff")}
          </span>
        </div>
        <SettingsHint className="mt-2">{t("subtitle")}</SettingsHint>
      </div>

      {!ready ? (
        <p className="aw-caption py-2">{tCommon("loading")}</p>
      ) : mode === null ? (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {enabled ? (
            <>
              <button
                type="button"
                onClick={() => setMode("change")}
                className={SETTINGS_BTN_GHOST}
              >
                {t("change")}
              </button>
              <button
                type="button"
                onClick={() => setMode("disable")}
                className={SETTINGS_BTN_GHOST}
              >
                {t("disable")}
              </button>
              {/* Plain-text link — the reset flow opens in a dialog. */}
              <button
                type="button"
                onClick={() => {
                  setForgotError(null);
                  setForgotOpen(true);
                }}
                className="text-[12px] text-[var(--muted)] underline-offset-2 hover:text-[var(--foreground)] hover:underline"
              >
                {t("forgotLink")}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setMode("set")}
              className={SETTINGS_BTN_GHOST}
            >
              {t("set")}
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3 pt-2">
          {enabled && (mode === "change" || mode === "disable") ? (
            <label className="block">
              <span className={fieldLabel}>{t("currentPin")}</span>
              <PinBoxes
                value={currentPin}
                onChange={setCurrentPin}
                disabled={busy}
                ariaLabel={t("currentPin")}
              />
            </label>
          ) : null}

          <label className="block">
            <span className={fieldLabel}>
              {mode === "disable" ? t("currentPin") : t("newPin")}
            </span>
            <PinBoxes
              value={pin}
              onChange={setPin}
              disabled={busy}
              error={
                mode === "set" &&
                confirmPin.length === TRADE_PIN_LENGTH &&
                pin !== confirmPin
              }
              ariaLabel={mode === "disable" ? t("currentPin") : t("newPin")}
            />
          </label>

          {mode === "set" ? (
            <label className="block">
              <span className={fieldLabel}>{t("confirmPin")}</span>
              <PinBoxes
                value={confirmPin}
                onChange={setPinConfirm}
                disabled={busy}
                error={confirmPin.length === TRADE_PIN_LENGTH && pin !== confirmPin}
                ariaLabel={t("confirmPin")}
              />
            </label>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <SubmitButton
              loading={busy}
              loadingLabel={tCommon("loading")}
              className={SETTINGS_SUBMIT_PRIMARY}
            >
              {mode === "disable" ? t("disableConfirm") : t("saveAction")}
            </SubmitButton>
            <button
              type="button"
              onClick={reset}
              disabled={busy}
              className={SETTINGS_BTN_GHOST}
            >
              {t("cancel")}
            </button>
            {message ? (
              <span
                className={`w-full text-[12px] ${
                  messageKind === "error"
                    ? "text-[var(--danger)]"
                    : "text-[var(--muted)]"
                }`}
              >
                {message}
              </span>
            ) : null}
          </div>
        </form>
      )}

      {/* Forgot-PIN reset: two-step dialog (verify login password → set new
          PIN) that advances in place — never a stacked window. */}
      <TradePasswordDialog
        open={forgotOpen}
        mode="forgot"
        title={t("forgotTitle")}
        hint={t("forgotHint1")}
        step2Hint={t("forgotHint2")}
        stepLabels={[t("stepVerify"), t("stepNew"), t("stepConfirm")]}
        verifyLabel={t("nextStep")}
        prevLabel={t("prevStep")}
        nextLabel={t("nextStep")}
        doneLabel={t("done")}
        onVerifyLogin={(lp) => onVerifyLogin(lp)}
        submitLabel={t("resetSubmit")}
        cancelLabel={t("cancel")}
        errorLabel={t("saveFailed")}
        mismatchLabel={t("errMismatch")}
        newPinLabel={t("newPin")}
        confirmPinLabel={t("confirmPin")}
        confirmAriaLabel={t("confirmPin")}
        loginPasswordLabel={t("loginPassword")}
        busy={resetMut.isPending}
        error={forgotError}
        onCancel={() => {
          if (!resetMut.isPending) {
            setForgotOpen(false);
            setForgotError(null);
          }
        }}
        onSubmit={(pin, loginPassword) => void onForgotSubmit(pin, loginPassword)}
      />
    </section>
  );
}
