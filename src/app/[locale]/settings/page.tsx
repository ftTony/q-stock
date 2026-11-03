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
    if (futu) {
      try {
        sessionStorage.setItem("q-stock.futu-oauth", futu);
      } catch {
        /* ignore */
      }
    }
    settingsModal?.openSettings(
      setupKeys
        ? { setupKeys: true }
        : futu
          ? { section: "market" }
          : undefined,
    );
    if (typeof window !== "undefined" && window.history.length > 1) {
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
