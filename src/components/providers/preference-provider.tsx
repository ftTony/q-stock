"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from "react";

export type ChangeColorScheme = "cn" | "us";

const STORAGE_KEY = "qstock.changeColorScheme";

const PreferenceContext = createContext<{
  changeColorScheme: ChangeColorScheme;
  setChangeColorScheme: (s: ChangeColorScheme) => void;
}>({
  changeColorScheme: "cn",
  setChangeColorScheme: () => undefined,
});

function applyScheme(s: ChangeColorScheme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.change = s;
}

function readStoredScheme(): ChangeColorScheme | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "cn" || v === "us") return v;
  } catch {
    /* ignore */
  }
  return null;
}

function persistScheme(s: ChangeColorScheme) {
  try {
    window.localStorage.setItem(STORAGE_KEY, s);
  } catch {
    /* ignore */
  }
}

export function PreferenceProvider({
  children,
  initialScheme,
}: {
  children: React.ReactNode;
  /** From session when logged in; omit for guests (uses localStorage / cn) */
  initialScheme?: ChangeColorScheme | null;
}) {
  const [changeColorScheme, setScheme] = useState<ChangeColorScheme>(
    () => initialScheme || "cn",
  );

  useLayoutEffect(() => {
    const next =
      initialScheme === "cn" || initialScheme === "us"
        ? initialScheme
        : readStoredScheme() || "cn";
    setScheme(next);
    applyScheme(next);
    persistScheme(next);
  }, [initialScheme]);

  const setChangeColorScheme = useCallback((s: ChangeColorScheme) => {
    setScheme(s);
    applyScheme(s);
    persistScheme(s);
  }, []);

  return (
    <PreferenceContext.Provider
      value={{ changeColorScheme, setChangeColorScheme }}
    >
      {children}
    </PreferenceContext.Provider>
  );
}

export function usePreference() {
  return useContext(PreferenceContext);
}
