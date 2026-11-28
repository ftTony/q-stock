"use client";

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import { useMounted } from "@/hooks/use-mounted";
import { SubmitButton } from "@/components/ui/submit-button";
import { PinBoxes } from "@/components/trading/pin-boxes";
import { TRADE_PIN_LENGTH } from "@/lib/trading/trade-password";

type Props = {
  open: boolean;
  /**
   * "enter" verifies an existing PIN (single auto-submit step).
   * "set" creates one: new PIN → confirm PIN (two auto steps).
   * "forgot" resets via the login password: verify → new → confirm.
   */
  mode?: "enter" | "set" | "forgot";
  title: string;
  /** Hint for the first step; later steps fall back to `step2Hint`. */
  hint: string;
  /** Hint for the new-PIN step (and the confirm step when unset). */
  step2Hint?: string;
  submitLabel: string;
  cancelLabel: string;
  errorLabel: string;
  /** Step labels for the Ant-Steps-style indicator (set/forgot modes). */
  stepLabels?: [string, string] | [string, string, string];
  /** Local validation copy for the set/forgot-mode PIN mismatch. */
  mismatchLabel?: string;
  /** Optional labels above the two box groups. */
  newPinLabel?: string;
  confirmPinLabel?: string;
  confirmAriaLabel?: string;
  /** Label above the forgot-mode login-password field. */
  loginPasswordLabel?: string;
  forgotLinkLabel?: string;
  /** Button on the login step — advances after verification. */
  verifyLabel?: string;
  /** Back button on the new/confirm PIN steps. */
  prevLabel?: string;
  /** Primary button on the new-PIN step ("下一步"). */
  nextLabel?: string;
  /** Primary button on the confirm step ("完成"). */
  doneLabel?: string;
  /**
   * Forgot mode: verify the login password. Resolve → advance to the new-PIN
   * step; reject → stay (parent surfaces the error).
   */
  onVerifyLogin?: (loginPassword: string) => Promise<void>;
  /** Shown in enter mode when provided — opens the forgot flow. */
  onForgot?: () => void;
  busy?: boolean;
  error?: string | null;
  onCancel: () => void;
  /** Called with the entered PIN (+ login password in forgot mode). */
  onSubmit: (pin: string, loginPassword?: string) => void;
};

type Step = "login" | "new" | "confirm";

/**
 * Trade-password dialog with an in-place step wizard (Ant-Steps-style
 * indicator). Steps advance inside the same dialog — never a stacked window.
 * Desktop: centered card. H5: iOS-style bottom sheet.
 */
export function TradePasswordDialog({
  open,
  mode = "enter",
  title,
  hint,
  step2Hint,
  submitLabel,
  cancelLabel,
  errorLabel,
  stepLabels,
  mismatchLabel,
  newPinLabel,
  confirmPinLabel,
  confirmAriaLabel,
  loginPasswordLabel,
  forgotLinkLabel,
  verifyLabel,
  prevLabel,
  nextLabel,
  doneLabel,
  onVerifyLogin,
  onForgot,
  busy = false,
  error = null,
  onCancel,
  onSubmit,
}: Props) {
  const mounted = useMounted();
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const submittedRef = useRef<string | null>(null);

  const displayError = error ?? localError;

  // Step model per mode.
  const steps: Step[] =
    mode === "forgot"
      ? ["login", "new", "confirm"]
      : mode === "set"
        ? ["new", "confirm"]
        : [];
  const cur: Step | undefined = mode === "enter" ? undefined : steps[stepIdx];

  // Reset everything when the dialog opens or the mode changes.
  useEffect(() => {
    if (!open) return;
    setPin("");
    setConfirm("");
    setLoginPassword("");
    setLocalError(null);
    setStepIdx(0);
    setVerifying(false);
    submittedRef.current = null;
  }, [open, mode]);

  // Enter mode: no steps, no buttons — the 6th digit submits immediately.
  useEffect(() => {
    if (!open || mode !== "enter") return;
    if (displayError) {
      // Server rejected the PIN — allow re-entering the same digits.
      submittedRef.current = null;
      return;
    }
    if (busy) return;
    if (pin.length === TRADE_PIN_LENGTH && submittedRef.current !== pin) {
      submittedRef.current = pin;
      onSubmit(pin);
    }
  }, [open, mode, busy, pin, displayError, onSubmit]);

  // New/confirm PIN steps are driven by the footer buttons (上一步/完成) —
  // no auto-advance, so the user can always go back and re-edit.

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy && !verifying) onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, verifying, onCancel]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted || !open || typeof document === "undefined") return null;

  /** Back to the previous wizard step (confirm → new → login). */
  function goBack() {
    if (busy || verifying) return;
    setLocalError(null);
    if (cur === "confirm") {
      setConfirm("");
      submittedRef.current = null;
    }
    setStepIdx((s) => Math.max(0, s - 1));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (busy || verifying) return;
    if (mode === "enter") {
      if (pin.length !== TRADE_PIN_LENGTH) return;
      onSubmit(pin);
      return;
    }
    // Login step: verify the password, then advance in place.
    if (cur === "login") {
      if (!loginPassword || !onVerifyLogin) return;
      setVerifying(true);
      void (async () => {
        try {
          await onVerifyLogin(loginPassword);
          setLocalError(null);
          setStepIdx((s) => s + 1);
        } catch {
          // Parent surfaces the error; stay on the login step.
        } finally {
          setVerifying(false);
        }
      })();
      return;
    }
    // New-PIN step: advance to the confirm step.
    if (cur === "new") {
      if (pin.length !== TRADE_PIN_LENGTH) return;
      setLocalError(null);
      setStepIdx((s) => s + 1);
      return;
    }
    // Confirm step: submit when it matches; on mismatch show the error and
    // clear the confirm boxes for a re-entry.
    if (cur === "confirm") {
      if (confirm.length !== TRADE_PIN_LENGTH) return;
      if (pin !== confirm) {
        setLocalError(mismatchLabel ?? errorLabel);
        setConfirm("");
        return;
      }
      if (submittedRef.current !== confirm) {
        submittedRef.current = confirm;
        onSubmit(pin, mode === "forgot" ? loginPassword : undefined);
      }
    }
  }

  const displayHint =
    cur === "login" || cur === undefined ? hint : (step2Hint ?? hint);

  // One form/panel with responsive positioning: H5 bottom sheet, desktop
  // centered card.
  const panelClass =
    "relative z-10 w-full border border-[var(--border)] bg-[var(--panel)] " +
    // H5: bottom sheet
    "absolute inset-x-0 bottom-0 rounded-t-2xl border-b-0 px-5 pt-4 " +
    "pb-[max(1rem,env(safe-area-inset-bottom,0px))] " +
    "shadow-[0_-8px_32px_rgba(15,23,42,0.18)] " +
    // Desktop: centered card
    "lg:inset-x-auto lg:bottom-auto lg:left-1/2 lg:top-1/2 lg:w-full lg:max-w-sm " +
    "lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-none lg:border " +
    "lg:p-5 lg:shadow-[0_24px_80px_rgba(15,23,42,0.28)]";

  const circleBase =
    "flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold leading-none";

  return createPortal(
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={cancelLabel}
        disabled={busy || verifying}
        onClick={onCancel}
      />

      <form onSubmit={submit} className={panelClass}>
        <div className="relative">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--border)] lg:hidden" />
          <h2 className="pr-8 text-[18px] font-semibold tracking-tight text-[var(--foreground)]">
            {title}
          </h2>
          <button
            type="button"
            aria-label={cancelLabel}
            disabled={busy || verifying}
            onClick={onCancel}
            className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-none text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
            </svg>
          </button>
        </div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">
          {displayHint}
        </p>

        {/* Ant-Steps-style indicator: numbered circles, connector lines, labels. */}
        {cur ? (
          <div className="mt-4 flex items-start" aria-hidden>
            {steps.map((s, i) => {
              const done = i < stepIdx;
              const active = i === stepIdx;
              return (
                <Fragment key={s}>
                  {i > 0 ? (
                    <div
                      className={`mt-[9px] h-px flex-1 ${
                        done ? "bg-[var(--foreground)]" : "bg-[var(--border)]"
                      }`}
                    />
                  ) : null}
                  <div className="flex w-16 flex-col items-center gap-1">
                    <span
                      className={`${circleBase} ${
                        done || active
                          ? "bg-[var(--foreground)] text-[var(--background)]"
                          : "border border-[var(--muted)] text-[var(--muted)]"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <span
                      className={`text-[10px] leading-tight ${
                        active
                          ? "font-medium text-[var(--foreground)]"
                          : "text-[var(--muted)]"
                      }`}
                    >
                      {stepLabels?.[i] ?? ""}
                    </span>
                  </div>
                </Fragment>
              );
            })}
          </div>
        ) : null}

        {mode === "enter" ? (
          <>
            <div className="mt-4">
              <PinBoxes
                value={pin}
                onChange={setPin}
                disabled={busy}
                error={Boolean(displayError)}
                autoFocus
                ariaLabel={title}
              />
            </div>
            {onForgot && forgotLinkLabel ? (
              <button
                type="button"
                className="mt-2 block w-full text-right text-[12px] text-[var(--muted)] underline-offset-2 hover:text-[var(--foreground)] hover:underline"
                onClick={onForgot}
              >
                {forgotLinkLabel}
              </button>
            ) : null}
          </>
        ) : cur === "login" ? (
          <div className="mt-4">
            <span className="mb-1.5 block text-[12px] text-[var(--muted)]">
              {loginPasswordLabel}
            </span>
            <input
              type="password"
              autoComplete="current-password"
              value={loginPassword}
              disabled={busy || verifying}
              autoFocus
              onChange={(e) => setLoginPassword(e.target.value)}
              className={`qt-input !h-11 w-full !rounded-none px-3 text-[14px] ${
                displayError ? "!border-[var(--danger)]" : ""
              }`}
            />
          </div>
        ) : cur === "new" ? (
          <div className="mt-4">
            <span className="mb-1.5 block text-[12px] text-[var(--muted)]">
              {newPinLabel}
            </span>
            <PinBoxes
              value={pin}
              onChange={(v) => {
                setPin(v);
                setLocalError(null);
              }}
              disabled={busy}
              error={Boolean(displayError)}
              autoFocus
              ariaLabel={newPinLabel ?? title}
            />
          </div>
        ) : (
          <div className="mt-4">
            <span className="mb-1.5 block text-[12px] text-[var(--muted)]">
              {confirmPinLabel}
            </span>
            <PinBoxes
              value={confirm}
              onChange={(v) => {
                setConfirm(v);
                setLocalError(null);
              }}
              disabled={busy}
              error={Boolean(displayError)}
              autoFocus
              ariaLabel={confirmAriaLabel ?? title}
            />
          </div>
        )}

        {displayError ? (
          <p role="alert" className="mt-2 text-[12px] text-[var(--danger)]">
            {displayError}
          </p>
        ) : null}

        {/* Footer buttons per step: login → 下一步 only; new → 上一步+下一步;
            confirm → 上一步+完成. Closing (×/backdrop/Esc) cancels instead. */}
        {cur === "login" ? (
          <div className="mt-5">
            <SubmitButton
              type="submit"
              loading={verifying}
              disabled={busy || verifying || !loginPassword}
              className="qt-btn qt-btn-primary !h-11 w-full !rounded-none text-[13px] font-semibold"
            >
              {verifyLabel ?? submitLabel}
            </SubmitButton>
          </div>
        ) : cur === "new" || cur === "confirm" ? (
          <div className="mt-5 flex gap-2.5">
            {stepIdx > 0 ? (
              <button
                type="button"
                className="qt-btn qt-btn-ghost !h-11 flex-1 !rounded-none text-[13px] font-medium"
                disabled={busy || verifying}
                onClick={goBack}
              >
                {prevLabel ?? cancelLabel}
              </button>
            ) : null}
            <SubmitButton
              type="submit"
              loading={busy}
              disabled={
                busy ||
                verifying ||
                (cur === "new"
                  ? pin.length !== TRADE_PIN_LENGTH
                  : confirm.length !== TRADE_PIN_LENGTH)
              }
              className="qt-btn qt-btn-primary !h-11 flex-1 !rounded-none text-[13px] font-semibold"
            >
              {cur === "new"
                ? (nextLabel ?? doneLabel ?? submitLabel)
                : (doneLabel ?? submitLabel)}
            </SubmitButton>
          </div>
        ) : null}
      </form>
    </div>,
    document.body,
  );
}
