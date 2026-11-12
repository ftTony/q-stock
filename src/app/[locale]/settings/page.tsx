"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useSettingsModalOptional } from "@/components/settings/settings-modal-context";

/**
 * Deep-link entry (`/settings`, `/settings?setupKeys=1`).
 * Opens the shell settings modal and leaves the route so the prior page stays underneath.
 */
function SettingsDeepLink() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const settingsModal = useSettingsModalOptional();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const setupKeys = searchParams.get("setupKeys") === "1";
    const futu = searchParams.get("futu");
    const longbridge = searchParams.get("longbridge");
    if (futu) {
      try {
        sessionStorage.setItem("q-stock.futu-oauth", futu);
      } catch {
        /* ignore */
      }
    }
    if (longbridge) {
      try {
        sessionStorage.setItem("q-stock.lb-oauth", longbridge);
      } catch {
        /* ignore */
      }
    }
    settingsModal?.openSettings(
      setupKeys
        ? { setupKeys: true }
        : futu || longbridge
          ? { section: "market" }
          : undefined,
    );
    // OAuth callback history is … → broker authorize → /settings?…;
    // router.back() would return to the broker page and restart auth.
    if (futu || longbridge) {
      router.replace("/markets");
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.replace("/markets");
    }
  }, [router, searchParams, settingsModal]);

  return null;
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsDeepLink />
    </Suspense>
  );
}
