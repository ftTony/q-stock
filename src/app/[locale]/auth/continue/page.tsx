"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { pathAfterAuth } from "@/lib/market/creds-status-client";

/** Post-OAuth landing: route to settings setup or home. */
export default function AuthContinuePage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { status } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
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
  }, [status, router, t]);

  return (
    <div className="qt-panel w-full space-y-3 p-6 sm:p-8">
      <p className="text-sm text-[var(--muted)]">
        {error ?? tCommon("loading")}
      </p>
    </div>
  );
}
