"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { PreferenceProvider } from "@/components/providers/preference-provider";

export function AppProviders({
  children,
  changeColorScheme = "cn",
}: {
  children: React.ReactNode;
  changeColorScheme?: "cn" | "us";
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
