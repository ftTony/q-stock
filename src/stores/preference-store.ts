"use client";

import { create } from "zustand";
import { useSession } from "next-auth/react";
import { useLayoutEffect } from "react";

export type ChangeColorScheme = "cn" | "us";

const STORAGE_KEY = "qstock.changeColorScheme";

type PreferenceState = {
  changeColorScheme: ChangeColorScheme;
  setChangeColorScheme: (s: ChangeColorScheme) => void;
  hydrate: (s: ChangeColorScheme) => void;
};

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

export const usePreferenceStore = create<PreferenceState>((set) => ({
  changeColorScheme: "cn",
  setChangeColorScheme: (s) => {
    applyScheme(s);
    persistScheme(s);
    set({ changeColorScheme: s });
  },
  hydrate: (s) => {
    applyScheme(s);
    persistScheme(s);
    set({ changeColorScheme: s });
  },
}));

/** Syncs session / localStorage into the Zustand preference store. */
export function PreferenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const hydrate = usePreferenceStore((s) => s.hydrate);
  const sessionScheme =
    session?.user?.changeColorScheme === "cn" ||
    session?.user?.changeColorScheme === "us"
      ? session.user.changeColorScheme
      : null;

  useLayoutEffect(() => {
    const next = sessionScheme || readStoredScheme() || "cn";
    hydrate(next);
  }, [sessionScheme, hydrate]);

  return children;
}

export function usePreference() {
  const changeColorScheme = usePreferenceStore((s) => s.changeColorScheme);
  const setChangeColorScheme = usePreferenceStore(
    (s) => s.setChangeColorScheme,
  );
  return { changeColorScheme, setChangeColorScheme };
}
