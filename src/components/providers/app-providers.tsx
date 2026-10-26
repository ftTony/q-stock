"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { PreferenceProvider } from "@/components/providers/preference-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { PwaRegister } from "@/components/pwa/pwa-register";

export function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <QueryProvider>
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
      </QueryProvider>
    </SessionProvider>
  );
}
