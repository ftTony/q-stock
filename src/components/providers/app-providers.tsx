"use client";

import { ThemeProvider } from "next-themes";
import { AuthSessionProvider } from "@/components/providers/auth-session-provider";
import { PreferenceProvider } from "@/components/providers/preference-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { TradePinGateProvider } from "@/components/trading/trade-pin-gate";
import { PwaRegister } from "@/components/pwa/pwa-register";

export function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthSessionProvider>
      <QueryProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <PreferenceProvider>
            <TradePinGateProvider>
              <PwaRegister />
              {children}
            </TradePinGateProvider>
          </PreferenceProvider>
        </ThemeProvider>
      </QueryProvider>
    </AuthSessionProvider>
  );
}
