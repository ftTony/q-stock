/**
 * Browser Worker entry for the option pricer.
 *
 * The American model runs 9 CRR trees (~10-15k nodes each) per quote, which is
 * the only measurable main-thread hot spot on the symbol page. This entry just
 * dispatches messages; the pricing logic stays in `option-calculator.ts` so the
 * worker and the synchronous fallback share one implementation.
 */
import { calcOption } from "./option-calculator";
import type {
  OptionCalcRequest,
  OptionCalcResponse,
} from "./option-calculator-protocol";

type WorkerScope = {
  onmessage: ((event: MessageEvent<OptionCalcRequest>) => void) | null;
  postMessage: (message: OptionCalcResponse) => void;
};

// Casting through `unknown` keeps this file valid under the app's DOM-only
// tsconfig (no `webworker` lib, which would redeclare `self`).
const scope = self as unknown as WorkerScope;

scope.onmessage = (event) => {
  const { id, input } = event.data;
  scope.postMessage({ id, result: calcOption(input) });
};
