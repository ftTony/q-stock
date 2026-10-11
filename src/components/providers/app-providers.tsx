"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { PreferenceProvider } from "@/components/providers/preference-provider";
import { PwaRegister } from "@/components/pwa/pwa-register";

export function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <PreferenceProvider>
          <PwaRegister />
          {children}
        </PreferenceProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
