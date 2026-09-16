"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Scheme = "cn" | "us";

const PreferenceContext = createContext<{
  changeColorScheme: Scheme;
  setChangeColorScheme: (s: Scheme) => void;
}>({
  changeColorScheme: "cn",
  setChangeColorScheme: () => undefined,
});

export function PreferenceProvider({
  children,
  initialScheme = "us",
}: {
  children: React.ReactNode;
  initialScheme?: Scheme;
}) {
  const [changeColorScheme, setScheme] = useState<Scheme>(initialScheme);

  const setChangeColorScheme = useCallback((s: Scheme) => {
    setScheme(s);
    if (typeof document !== "undefined") {
      document.documentElement.dataset.change = s;
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.change = changeColorScheme;
  }, [changeColorScheme]);

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
