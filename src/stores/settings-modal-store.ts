"use client";

import { create } from "zustand";

type OpenOpts = { setupKeys?: boolean };

type SettingsModalState = {
  open: boolean;
  setupKeys: boolean;
  openSettings: (opts?: OpenOpts) => void;
  closeSettings: () => void;
};

export const useSettingsModalStore = create<SettingsModalState>((set) => ({
  open: false,
  setupKeys: false,
  openSettings: (opts) =>
    set({ open: true, setupKeys: Boolean(opts?.setupKeys) }),
  closeSettings: () => set({ open: false, setupKeys: false }),
}));

export function useSettingsModal() {
  return useSettingsModalStore();
}

/** Always available (Zustand); kept for call-site compatibility. */
export function useSettingsModalOptional() {
  return useSettingsModalStore();
}

export function SettingsModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
