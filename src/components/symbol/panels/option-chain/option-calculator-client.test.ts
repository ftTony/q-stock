import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { calcOption, type CalcInput } from "./option-calculator";
import {
  calcOptionAsync,
  getOptionWorkerDiagnostics,
  resetOptionWorker,
} from "./option-calculator-client";
import type {
  OptionCalcRequest,
  OptionCalcResponse,
} from "./option-calculator-protocol";

const call = (strike: number): CalcInput => ({
  spot: 100,
  strike,
  ivPct: 30,
  days: 30,
  ratePct: 4,
  isCall: true,
  model: "american",
});

class FakeWorker {
  static last: FakeWorker | null = null;
  static autoReply = true;
  onmessage: ((event: MessageEvent<OptionCalcResponse>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  terminated = false;
  sent: OptionCalcRequest[] = [];

  constructor() {
    FakeWorker.last = this;
  }

  postMessage(message: OptionCalcRequest) {
    this.sent.push(message);
    if (!FakeWorker.autoReply) return;
    queueMicrotask(() => {
      this.onmessage?.({
        data: { id: message.id, result: calcOption(message.input) },
      } as unknown as MessageEvent<OptionCalcResponse>);
    });
  }

  terminate() {
    this.terminated = true;
  }

  reply(id: number, input: CalcInput) {
    this.onmessage?.({
      data: { id, result: calcOption(input) },
    } as unknown as MessageEvent<OptionCalcResponse>);
  }

  fail() {
    this.onerror?.({ message: "boom" } as unknown as ErrorEvent);
  }
}

describe("calcOptionAsync", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("Worker", FakeWorker);
    FakeWorker.last = null;
    FakeWorker.autoReply = true;
    resetOptionWorker();
  });

  afterEach(() => {
    resetOptionWorker();
    vi.unstubAllGlobals();
  });

  it("prices in the worker and reports viaWorker", async () => {
    const input = call(100);
    const outcome = await calcOptionAsync(input);

    expect(outcome.viaWorker).toBe(true);
    expect(outcome.result).toEqual(calcOption(input));
    expect(FakeWorker.last?.sent).toEqual([{ id: 1, input }]);
    expect(getOptionWorkerDiagnostics().workerCalls).toBe(1);
    expect(getOptionWorkerDiagnostics().active).toBe(true);
  });

  it("reuses one worker across calls", async () => {
    await calcOptionAsync(call(100));
    await calcOptionAsync(call(110));

    expect(FakeWorker.last?.sent).toHaveLength(2);
    expect(getOptionWorkerDiagnostics().workerCalls).toBe(2);
  });

  it("matches out-of-order replies by request id", async () => {
    FakeWorker.autoReply = false;
    const first = calcOptionAsync(call(100));
    const second = calcOptionAsync(call(110));
    const worker = FakeWorker.last!;

    // Reply in reverse order; each promise must still get its own result.
    worker.reply(worker.sent[1]!.id, call(110));
    worker.reply(worker.sent[0]!.id, call(100));

    expect((await first).result).toEqual(calcOption(call(100)));
    expect((await second).result).toEqual(calcOption(call(110)));
  });

  it("falls back synchronously when forced", async () => {
    const outcome = await calcOptionAsync(call(100), { forceSync: true });

    expect(outcome.viaWorker).toBe(false);
    expect(outcome.result).toEqual(calcOption(call(100)));
    expect(FakeWorker.last).toBeNull();
    expect(getOptionWorkerDiagnostics().lastFallbackReason).toBe("forced-sync");
  });

  it("falls back synchronously on SSR", async () => {
    vi.stubGlobal("window", undefined);
    const outcome = await calcOptionAsync(call(100));

    expect(outcome.viaWorker).toBe(false);
    expect(FakeWorker.last).toBeNull();
    expect(getOptionWorkerDiagnostics().lastFallbackReason).toBe("ssr");
  });

  it("falls back and replaces the worker on error", async () => {
    FakeWorker.autoReply = false;
    const promise = calcOptionAsync(call(100));
    FakeWorker.last!.fail();

    const outcome = await promise;
    expect(outcome.viaWorker).toBe(false);
    expect(outcome.result).toEqual(calcOption(call(100)));
    expect(FakeWorker.last!.terminated).toBe(true);
    expect(getOptionWorkerDiagnostics().lastFallbackReason).toBe("worker-error");

    // The next call must be able to use a fresh worker.
    FakeWorker.autoReply = true;
    const recovered = await calcOptionAsync(call(100));
    expect(recovered.viaWorker).toBe(true);
    expect(getOptionWorkerDiagnostics().workerCalls).toBe(1);
  });

  it("falls back and drops a stuck worker on timeout", async () => {
    FakeWorker.autoReply = false;
    const outcome = await calcOptionAsync(call(100), { timeoutMs: 10 });

    expect(outcome.viaWorker).toBe(false);
    expect(outcome.result).toEqual(calcOption(call(100)));
    expect(FakeWorker.last!.terminated).toBe(true);
    expect(getOptionWorkerDiagnostics().lastFallbackReason).toBe("timeout");
  });

  it("falls back and drops the worker when postMessage throws", async () => {
    class ThrowingWorker extends FakeWorker {
      constructor() {
        super();
        this.postMessage = () => {
          throw new Error("clone failed");
        };
      }
    }
    vi.stubGlobal("Worker", ThrowingWorker);

    const outcome = await calcOptionAsync(call(100));
    expect(outcome.viaWorker).toBe(false);
    expect(outcome.result).toEqual(calcOption(call(100)));
    expect(FakeWorker.last!.terminated).toBe(true);
    expect(getOptionWorkerDiagnostics().lastFallbackReason).toBe(
      "post-message-failed",
    );
  });
});
