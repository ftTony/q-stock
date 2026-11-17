"use client";

import { useEffect, useRef } from "react";
import { signIn, useSession } from "@/lib/auth/react";
import { useLocale } from "next-intl";
import { localizedPath } from "@/i18n/config";

/**
 * Google One Tap (FedCM)  -  the browser-level "continue as <name>" prompt, like
 * longbridge.com. Renders nothing; mounts the Google Identity script once the
 * user is logged out, then lets Chrome show the account chooser.
 *
 * Requires:
 * - AUTH_GOOGLE_ID passed down from the server layout (not a secret).
 * - The OAuth client (Google Cloud Console  Credentials) must include the
 *   site origin in **Authorized JavaScript origins** (no redirect URI needed
 *   for One Tap itself).
 */

type GsiIdApi = {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential?: string }) => void;
    auto_select?: boolean;
    use_fedcm_for_prompt?: boolean;
  }) => void;
  prompt: (listener?: (notification: {
    getNotDisplayedReason: () => string;
    getSkippedReason: () => string;
    getDismissedReason: () => string;
  }) => void) => void;
  disableAutoSelect: () => void;
};

type GsiWindow = Window & {
  google?: { accounts: { id: GsiIdApi } };
};

let gsiScriptPromise: Promise<GsiIdApi | null> | null = null;

function loadGsi(): Promise<GsiIdApi | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  const w = window as GsiWindow;
  if (w.google?.accounts?.id) return Promise.resolve(w.google.accounts.id);
  if (gsiScriptPromise) return gsiScriptPromise;

  gsiScriptPromise = new Promise((resolve) => {
    const src = "https://accounts.google.com/gsi/client";
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve((window as GsiWindow).google?.accounts.id ?? null);
    };

    const el = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (el) {
      // Script tag already present (another caller won the race, or a retry).
      finish();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", finish);
    script.addEventListener("error", () => {
      if (settled) return;
      settled = true;
      gsiScriptPromise = null;
      resolve(null);
    });
    document.head.appendChild(script);
  });
  return gsiScriptPromise;
}

export function GoogleOneTapGate({ clientId }: { clientId: string }) {
  const { status } = useSession();
  const locale = useLocale();
  const prompted = useRef(false);

  useEffect(() => {
    if (!clientId || prompted.current) return;
    if (status === "loading") return;

    if (status === "authenticated") {
      // Don't let Google auto-select into a stale prompt after sign-out.
      void loadGsi().then((gsi) => gsi?.disableAutoSelect());
      return;
    }

    let cancelled = false;
    (async () => {
      const gsi = await loadGsi();
      if (!gsi || cancelled) return;
      prompted.current = true;
      gsi.initialize({
        client_id: clientId,
        use_fedcm_for_prompt: true,
        auto_select: false,
        callback: (response) => {
          const credential = response?.credential;
          if (!credential) return;
          void signIn("onetap", {
            credential,
            callbackUrl: localizedPath(locale, "/auth/continue"),
          });
        },
      });
      gsi.prompt((notification) => {
        // Google throttles repeats itself; once any terminal moment fires
        // (dismissed / skipped / suppressed) we stop re-prompting this visit.
        prompted.current = true;
        void notification;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [clientId, status, locale]);

  return null;
}
