"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type OpenOpts = { setupKeys?: boolean };

type SettingsModalContextValue = {
  open: boolean;
  setupKeys: boolean;
  openSettings: (opts?: OpenOpts) => void;
  closeSettings: () => void;
};

const SettingsModalContext = createContext<SettingsModalContextValue | null>(
  null,
);

export function SettingsModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [setupKeys, setSetupKeys] = useState(false);

  const openSettings = useCallback((opts?: OpenOpts) => {
    setSetupKeys(Boolean(opts?.setupKeys));
    setOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setOpen(false);
    setSetupKeys(false);
  }, []);

  const value = useMemo(
    () => ({ open, setupKeys, openSettings, closeSettings }),
    [open, setupKeys, openSettings, closeSettings],
  );

  return (
    <SettingsModalContext.Provider value={value}>
      {children}
    </SettingsModalContext.Provider>
  );
}

export function useSettingsModal() {
  const ctx = useContext(SettingsModalContext);
  if (!ctx) {
    throw new Error("useSettingsModal must be used within SettingsModalProvider");
  }
  return ctx;
}

/** Safe for chrome that may render outside the provider (returns no-ops). */
export function useSettingsModalOptional() {
  return useContext(SettingsModalContext);
}
