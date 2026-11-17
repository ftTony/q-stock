"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { pathAfterAuth } from "@/lib/market/creds-status-client";
import { setTokenPair } from "@/lib/api/token-store";

/** Post-OAuth landing: ingest tokens from query, then route to setup or home. */
export default function AuthContinuePage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { status, update } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const access = params.get("accessToken");
      const refresh = params.get("refreshToken");
      const expiresIn = Number(params.get("expiresIn") || 1800);
      if (access) {
        setTokenPair(access, expiresIn, refresh);
        // Strip tokens from URL
        const url = new URL(window.location.href);
        url.searchParams.delete("accessToken");
        url.searchParams.delete("refreshToken");
        url.searchParams.delete("expiresIn");
        window.history.replaceState({}, "", url.pathname + url.search);
        void update().finally(() => setBootstrapped(true));
        return;
      }
    } catch {
      /* ignore */
    }
    setBootstrapped(true);
  }, [update]);

  useEffect(() => {
    if (!bootstrapped || status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const next = await pathAfterAuth();
        if (cancelled) return;
        router.replace(next);
        router.refresh();
      } catch {
        if (!cancelled) setError(t("oauthError"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bootstrapped, status, router, t]);

  return (
    <div className="qt-panel w-full space-y-3 p-6 sm:p-8">
      <p className="text-sm text-[var(--muted)]">
        {error ?? tCommon("loading")}
      </p>
    </div>
  );
}
