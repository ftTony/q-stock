"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TradePasswordDialog } from "@/components/trading/trade-password-dialog";
import {
  fetchJson,
} from "@/lib/query/fetch-json";
import {
  useSetTradePassword,
  useResetTradePassword,
  useVerifyLoginPassword,
} from "@/hooks/query/use-trading";
import { queryKeys } from "@/lib/query/keys";

export const TRADE_PIN_CANCELLED = "TRADE_PIN_CANCELLED";

/**
 * After a successful verification the PIN is remembered in sessionStorage for
 * a short window so consecutive trades don't re-prompt. It is never persisted
 * to localStorage and is dropped when the tab closes. A server-side
 * INVALID_TRADE_PASSWORD clears it immediately.
 */
const PIN_CACHE_KEY = "qs-trade-pin-cache";
const PIN_CACHE_TTL_MS = 10 * 60 * 1000;

function readCachedPin(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PIN_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { pin?: unknown; at?: unknown };
    if (
      typeof parsed.pin !== "string" ||
      typeof parsed.at !== "number" ||
      Date.now() - parsed.at > PIN_CACHE_TTL_MS
    ) {
      window.sessionStorage.removeItem(PIN_CACHE_KEY);
      return null;
    }
    return parsed.pin;
  } catch {
    return null;
  }
}

function cachePin(pin: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      PIN_CACHE_KEY,
      JSON.stringify({ pin, at: Date.now() }),
    );
  } catch {
    // Storage full/unavailable — verification still works, just re-prompts.
  }
}

function clearCachedPin() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PIN_CACHE_KEY);
  } catch {
    // Ignore.
  }
}

export function isTradePinCancelled(err: unknown): boolean {
  return (
    err !== null &&
    typeof err === "object" &&
    "code" in err &&
    (err as { code?: string }).code === TRADE_PIN_CANCELLED
  );
}

type GateContextValue = {
  /**
   * Wrap a trading/account write operation with the trade-password gate.
   * When a password is configured the user is prompted first; the collected
   * PIN is handed to `run` (which forwards it to the API). A wrong PIN shows
   * an inline error and re-prompts; a cancel rejects with TRADE_PIN_CANCELLED.
   */
  withPinGate: <T>(run: (pin: string) => Promise<T>) => Promise<T>;
};

const GateContext = createContext<GateContextValue | null>(null);

type QueueItem = {
  run: (pin: string) => Promise<unknown>;
  /** True when no password exists yet — collect a new one and persist it. */
  setFirst: boolean;
  resolve: (value: never) => void;
  reject: (err: unknown) => void;
};

/**
 * Global gate for every trading/account **write** action.
 *
 * The screen flow is: click action → trade-password sheet → (on success) the
 * mutation itself runs. It owns a single dialog instance and a FIFO queue so
 * overlapping mutations never stack dialogs. Read queries are intentionally
 * not gated — only state-changing operations need a PIN.
 */
export function TradePinGateProvider({ children }: { children: ReactNode }) {
  const t = useTranslations("tradePassword");
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const qc = useQueryClient();

  // Subscribe to the shared status query so enabling/disabling the password
  // in settings (which invalidates this key) is reflected immediately.
  const statusQuery = useQuery({
    queryKey: queryKeys.trading.tradePassword,
    enabled: signedIn,
    staleTime: 60_000,
    queryFn: () =>
      fetchJson<{ enabled: boolean }>("/api/trading/trade-password"),
  });

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<"enter" | "set" | "forgot">(
    "enter",
  );
  const setMut = useSetTradePassword();
  const resetMut = useResetTradePassword();
  const verifyMut = useVerifyLoginPassword();

  const queueRef = useRef<QueueItem[]>([]);

  // Password turned off (or status refreshed to disabled): drop any cached PIN.
  useEffect(() => {
    if (statusQuery.data && !statusQuery.data.enabled) clearCachedPin();
  }, [statusQuery.data]);

  /** Resolve the current enabled flag, fetching on demand if still unknown. */
  const resolveEnabled = useCallback(async (): Promise<boolean> => {
    if (statusQuery.data) return Boolean(statusQuery.data.enabled);
    if (!signedIn) return false;
    try {
      const data = await qc.fetchQuery({
        queryKey: queryKeys.trading.tradePassword,
        queryFn: () =>
          fetchJson<{ enabled: boolean }>("/api/trading/trade-password"),
        staleTime: 60_000,
      });
      return Boolean(data.enabled);
    } catch {
      return false;
    }
  }, [statusQuery.data, signedIn, qc]);

  const pump = useCallback(() => {
    if (queueRef.current.length > 0) {
      setDialogMode(queueRef.current[0]?.setFirst ? "set" : "enter");
      setError(null);
      setBusy(false);
      setOpen(true);
    } else {
      setOpen(false);
      setBusy(false);
      setError(null);
      setDialogMode("enter");
    }
  }, []);

  const withPinGate = useCallback(
    async <T,>(run: (pin: string) => Promise<T>): Promise<T> => {
      if (!signedIn) return run("");
      const needsPin = await resolveEnabled();
      // No password configured yet: the user must create one (6 digits)
      // before the gated action can proceed.
      const setFirst = !needsPin;

      // Recently verified: skip the dialog and run directly. If the cached
      // PIN has been invalidated server-side, drop it and fall through to
      // the normal prompt flow.
      if (!setFirst) {
        const cached = readCachedPin();
        if (cached) {
          try {
            return await run(cached);
          } catch (err) {
            if (
              (err as Error & { code?: string }).code !==
              "INVALID_TRADE_PASSWORD"
            ) {
              throw err;
            }
            clearCachedPin();
          }
        }
      }

      return new Promise<T>((resolve, reject) => {
        queueRef.current.push({
          run: run as (pin: string) => Promise<unknown>,
          setFirst,
          resolve: resolve as (value: never) => void,
          reject,
        });
        pump();
      });
    },
    [resolveEnabled, pump, signedIn],
  );

  const onSubmit = useCallback(
    async (pin: string, loginPassword?: string) => {
      const item = queueRef.current[0];
      if (!item) return;
      setBusy(true);
      setError(null);
      try {
        if (item.setFirst) {
          // First-time setup: persist the new PIN before running the action.
          await setMut.mutateAsync({ pin });
        } else if (dialogMode === "forgot") {
          // Forgotten PIN: verify login password, set the new PIN, then run.
          await resetMut.mutateAsync({ loginPassword: loginPassword ?? "", pin });
        }
        const result = await item.run(pin);
        // Success: start/refresh the short no-reprompt window.
        cachePin(pin);
        queueRef.current.shift();
        item.resolve(result as never);
        pump();
      } catch (err) {
        const code = (err as Error & { code?: string }).code;
        if (code === "INVALID_TRADE_PASSWORD") {
          // Stale PIN — drop the cache and keep the dialog open for a retry.
          clearCachedPin();
          setBusy(false);
          setError(t("errCurrent"));
          return;
        }
        if (item.setFirst || dialogMode === "forgot") {
          // Setup/reset failed — let the user retry.
          setBusy(false);
          setError(
            code === "INVALID_LOGIN_PASSWORD" ? t("errLoginPassword") : t("saveFailed"),
          );
          return;
        }
        queueRef.current.shift();
        item.reject(err);
        pump();
      }
    },
    [pump, t, setMut, resetMut, dialogMode],
  );

  const onCancel = useCallback(() => {
    const item = queueRef.current.shift();
    if (item) {
      const err = new Error("Trade password input cancelled") as Error & {
        code?: string;
      };
      err.code = TRADE_PIN_CANCELLED;
      item.reject(err);
    }
    pump();
  }, [pump]);

  const value = useMemo(() => ({ withPinGate }), [withPinGate]);

  return (
    <GateContext.Provider value={value}>
      {children}
      <TradePasswordDialog
        open={open}
        mode={dialogMode}
        title={
          dialogMode === "set"
            ? t("setTitleDialog")
            : dialogMode === "forgot"
              ? t("forgotTitle")
              : t("title_dialog")
        }
        hint={
          dialogMode === "set"
            ? t("setHintDialog")
            : dialogMode === "forgot"
              ? t("forgotHint1")
              : t("gateHint")
        }
        step2Hint={t("forgotHint2")}
        stepLabels={[t("stepVerify"), t("stepNew"), t("stepConfirm")]}
        verifyLabel={t("nextStep")}
        prevLabel={t("prevStep")}
        nextLabel={t("nextStep")}
        doneLabel={t("done")}
        onVerifyLogin={
          dialogMode === "forgot"
            ? (lp) =>
                (async () => {
                  try {
                    await verifyMut.mutateAsync(lp);
                    setError(null);
                  } catch (err) {
                    const code = (err as Error & { code?: string }).code;
                    setError(
                      code === "INVALID_LOGIN_PASSWORD"
                        ? t("errLoginPassword")
                        : code === "NO_LOGIN_PASSWORD"
                          ? t("errNoLoginPassword")
                          : t("saveFailed"),
                    );
                    throw err;
                  }
                })()
            : undefined
        }
        submitLabel={
          dialogMode === "set"
            ? t("setSubmit")
            : dialogMode === "forgot"
              ? t("resetSubmit")
              : t("gateSubmit")
        }
        cancelLabel={t("cancel")}
        errorLabel={t("errCurrent")}
        mismatchLabel={t("errMismatch")}
        newPinLabel={t("newPin")}
        confirmPinLabel={t("confirmPin")}
        loginPasswordLabel={t("loginPassword")}
        forgotLinkLabel={t("forgotLink")}
        onForgot={
          dialogMode === "enter"
            ? () => {
                setError(null);
                setDialogMode("forgot");
              }
            : undefined
        }
        busy={busy}
        error={error}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </GateContext.Provider>
  );
}

export function useTradePinGate(): GateContextValue {
  const ctx = useContext(GateContext);
  if (!ctx) {
    throw new Error("useTradePinGate must be used within TradePinGateProvider");
  }
  return ctx;
}
