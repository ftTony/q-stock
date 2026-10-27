"use client";

import { create } from "zustand";
import type { SettingsSection } from "@/components/settings/settings-panel";

type OpenOpts = {
  setupKeys?: boolean;
  /** Jump to a settings category (e.g. account for invite / AI BYOK). */
  section?: SettingsSection;
};

type SettingsModalState = {
  open: boolean;
  setupKeys: boolean;
  section: SettingsSection;
  openSettings: (opts?: OpenOpts) => void;
  closeSettings: () => void;
};

export const useSettingsModalStore = create<SettingsModalState>((set) => ({
  open: false,
  setupKeys: false,
  section: "general",
  openSettings: (opts) =>
    set({
      open: true,
      setupKeys: Boolean(opts?.setupKeys),
      section: opts?.setupKeys
        ? "market"
        : (opts?.section ?? "general"),
    }),
  closeSettings: () =>
    set({ open: false, setupKeys: false, section: "general" }),
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
