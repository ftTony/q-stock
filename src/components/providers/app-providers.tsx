"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import {
  PreferenceProvider,
  type ChangeColorScheme,
} from "@/components/providers/preference-provider";
import { PwaRegister } from "@/components/pwa/pwa-register";

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
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <PreferenceProvider initialScheme={changeColorScheme}>
          <PwaRegister />
          {children}
        </PreferenceProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
