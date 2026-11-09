"use client";

import { create } from "zustand";
import { useSession } from "next-auth/react";
import { useLayoutEffect } from "react";

export type ChangeColorScheme = "cn" | "us";

/** v2：旧 key 曾被「语言默认」误写入 cn，英文页会被盖成红涨。 */
const STORAGE_KEY = "qstock.changeColorScheme.v2";

type PreferenceState = {
  changeColorScheme: ChangeColorScheme;
  setChangeColorScheme: (s: ChangeColorScheme) => void;
  hydrate: (s: ChangeColorScheme, opts?: { persist?: boolean }) => void;
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

/** SSR 已按语言写好 `html[data-change]`；无显式偏好时沿用它。 */
function localeSchemeFromDom(): ChangeColorScheme {
  if (typeof document === "undefined") return "cn";
  const v = document.documentElement.dataset.change;
  return v === "us" || v === "cn" ? v : "cn";
}

export const usePreferenceStore = create<PreferenceState>((set) => ({
  changeColorScheme: "cn",
  setChangeColorScheme: (s) => {
    applyScheme(s);
    persistScheme(s);
    set({ changeColorScheme: s });
  },
  hydrate: (s, opts) => {
    applyScheme(s);
    if (opts?.persist) persistScheme(s);
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
    // 账号设置 > 用户显式本地偏好 > 当前语言 SSR 默认（勿把语言默认持久化）
    if (sessionScheme) {
      hydrate(sessionScheme, { persist: true });
      return;
    }
    const stored = readStoredScheme();
    if (stored) {
      hydrate(stored);
      return;
    }
    hydrate(localeSchemeFromDom());
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
