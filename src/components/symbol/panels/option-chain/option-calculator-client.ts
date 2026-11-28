/**
 * Client-side facade for the option pricer Worker.
 *
 * Every call resolves with `viaWorker` so callers (and diagnostics) can tell
 * whether the worker actually ran. All failure paths — SSR, unsupported
 * browser, construction/message errors, timeout — transparently fall back to
 * the synchronous `calcOption`, so the UI never hangs waiting for a worker.
 */
"use client";

import { useEffect, useState } from "react";
import { calcOption, type CalcInput, type CalcResult } from "./option-calculator";
import type {
  OptionCalcRequest,
  OptionCalcResponse,
} from "./option-calculator-protocol";

export type CalcOutcome = {
  result: CalcResult;
  viaWorker: boolean;
};

export type OptionWorkerDiagnostics = {
  workerCalls: number;
  syncCalls: number;
  /** Last reason a call bypassed or abandoned the worker. */
  lastFallbackReason: string | null;
  /** Whether a live worker currently exists. */
  active: boolean;
};

const DEFAULT_TIMEOUT_MS = 2000;

type Pending = {
  input: CalcInput;
  resolve: (outcome: CalcOutcome) => void;
  timer: ReturnType<typeof setTimeout>;
};

let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, Pending>();

const diagnostics: OptionWorkerDiagnostics = {
  workerCalls: 0,
  syncCalls: 0,
  lastFallbackReason: null,
  active: false,
};

function syncFallback(reason: string, input: CalcInput): CalcOutcome {
  diagnostics.syncCalls += 1;
  diagnostics.lastFallbackReason = reason;
  return { result: calcOption(input), viaWorker: false };
}

/** Resolve every in-flight request on the main thread and reset the worker. */
function settleAllSync(reason: string) {
  for (const [, entry] of pending) {
    clearTimeout(entry.timer);
    entry.resolve(syncFallback(reason, entry.input));
  }
  pending.clear();
}

function discardWorker() {
  if (!worker) return;
  worker.onmessage = null;
  worker.onerror = null;
  worker.terminate();
  worker = null;
  diagnostics.active = false;
}

function getWorker(): Worker | null {
  if (worker) return worker;
  if (typeof window === "undefined" || typeof Worker === "undefined") return null;

  try {
    const instance = new Worker(
      new URL("./option-calculator.worker.ts", import.meta.url),
      { type: "module" },
    );
    instance.onmessage = (event: MessageEvent<OptionCalcResponse>) => {
      const { id, result } = event.data;
      const entry = pending.get(id);
      if (!entry) return; // stale reply from a timed-out request
      clearTimeout(entry.timer);
      pending.delete(id);
      diagnostics.workerCalls += 1;
      entry.resolve({ result, viaWorker: true });
    };
    instance.onerror = () => {
      discardWorker();
      settleAllSync("worker-error");
    };
    worker = instance;
    diagnostics.active = true;
    return instance;
  } catch {
    return null;
  }
}

/**
 * Price an option off the main thread when possible. Always resolves.
 *
 * `forceSync` bypasses the worker entirely (useful for A/B measurement).
 */
export function calcOptionAsync(
  input: CalcInput,
  options: { timeoutMs?: number; forceSync?: boolean } = {},
): Promise<CalcOutcome> {
  if (options.forceSync) {
    return Promise.resolve(syncFallback("forced-sync", input));
  }

  const instance = getWorker();
  if (!instance) {
    const reason =
      typeof window === "undefined"
        ? "ssr"
        : typeof Worker === "undefined"
          ? "unsupported"
          : "worker-init-failed";
    return Promise.resolve(syncFallback(reason, input));
  }

  return new Promise<CalcOutcome>((resolve) => {
    const id = nextId++;
    const timer = setTimeout(() => {
      // A stuck worker would queue every later request, so replace it.
      discardWorker();
      settleAllSync("timeout");
    }, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
    pending.set(id, { input, resolve, timer });

    try {
      const message: OptionCalcRequest = { id, input };
      instance.postMessage(message);
    } catch {
      pending.delete(id);
      clearTimeout(timer);
      discardWorker();
      resolve(syncFallback("post-message-failed", input));
    }
  });
}

/** Read-only snapshot; call from the console to verify the worker is live. */
export function getOptionWorkerDiagnostics(): OptionWorkerDiagnostics {
  return { ...diagnostics };
}

/** Test/teardown helper: drop the worker without resolving in-flight calls. */
export function resetOptionWorker(): void {
  for (const [, entry] of pending) clearTimeout(entry.timer);
  pending.clear();
  discardWorker();
  diagnostics.workerCalls = 0;
  diagnostics.syncCalls = 0;
  diagnostics.lastFallbackReason = null;
}

/**
 * React binding. First paint is computed synchronously (so SSR/hydration show
 * the same numbers); subsequent input changes are priced in the worker.
 */
export function useOptionCalc(
  input: CalcInput | null,
  options: { timeoutMs?: number; forceSync?: boolean } = {},
): { result: CalcResult | null; viaWorker: boolean } {
  const [state, setState] = useState<{
    result: CalcResult | null;
    viaWorker: boolean;
  }>(() => ({ result: input ? calcOption(input) : null, viaWorker: false }));

  useEffect(() => {
    if (!input) {
      setState({ result: null, viaWorker: false });
      return;
    }
    let cancelled = false;
    calcOptionAsync(input, options).then((outcome) => {
      if (!cancelled) {
        setState({ result: outcome.result, viaWorker: outcome.viaWorker });
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, options.timeoutMs, options.forceSync]);

  return state;
}
