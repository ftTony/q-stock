"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import {
  PreferenceProvider,
  type ChangeColorScheme,
} from "@/components/providers/preference-provider";

export function AppProviders({
  children,
  changeColorScheme = null,
}: {
  children: React.ReactNode;
  /** Session preference when logged in; null → localStorage / default cn */
  changeColorScheme?: ChangeColorScheme | null;
}) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <PreferenceProvider initialScheme={changeColorScheme}>
          {children}
        </PreferenceProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
