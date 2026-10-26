"use client";

import { create } from "zustand";

export type BlockEditTarget =
  | { kind: "meta" }
  | { kind: "entry"; index: number }
  | { kind: "exit"; index: number }
  | { kind: "sizing" };

type StrategyBlocksState = {
  edit: BlockEditTarget | null;
  openEdit: (target: BlockEditTarget) => void;
  closeEdit: () => void;
};

/** UI-only: which building-block / meta popup is open. */
export const useStrategyBlocksStore = create<StrategyBlocksState>((set) => ({
  edit: null,
  openEdit: (edit) => set({ edit }),
  closeEdit: () => set({ edit: null }),
}));
