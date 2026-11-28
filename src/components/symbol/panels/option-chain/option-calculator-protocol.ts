import type { CalcInput, CalcResult } from "./option-calculator";

/** One pricing request. `id` correlates replies when calls overlap. */
export type OptionCalcRequest = {
  id: number;
  input: CalcInput;
};

export type OptionCalcResponse = {
  id: number;
  result: CalcResult;
};
