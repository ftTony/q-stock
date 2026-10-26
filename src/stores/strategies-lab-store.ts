import { create } from "zustand";

export type StrategiesLabTab = "templates" | "mine" | "history";

type StrategiesLabState = {
  tab: StrategiesLabTab;
  query: string;
  setTab: (tab: StrategiesLabTab) => void;
  setQuery: (query: string) => void;
  reset: () => void;
};

const initial = {
  tab: "templates" as StrategiesLabTab,
  query: "",
};

/** Client UI state for the Rule Lab index (tabs / search). Server data stays in React Query. */
export const useStrategiesLabStore = create<StrategiesLabState>((set) => ({
  ...initial,
  setTab: (tab) => set({ tab }),
  setQuery: (query) => set({ query }),
  reset: () => set(initial),
}));
