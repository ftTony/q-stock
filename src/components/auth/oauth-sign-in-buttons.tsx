"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";

type OAuthId = "google" | "github";

/** Google / GitHub buttons; only shows providers enabled on the server. */
export function OAuthSignInButtons({ disabled }: { disabled?: boolean }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [providers, setProviders] = useState<OAuthId[]>([]);
  const [busy, setBusy] = useState<OAuthId | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/providers");
        if (!res.ok) return;
        const data = (await res.json()) as Record<string, unknown>;
        const list: OAuthId[] = [];
        if (data.google) list.push("google");
        if (data.github) list.push("github");
        if (!cancelled) setProviders(list);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!providers.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
        <span className="h-px flex-1 bg-[var(--border)]" />
        <span>{t("orContinueWith")}</span>
        <span className="h-px flex-1 bg-[var(--border)]" />
      </div>
      {providers.map((id) => (
        <button
          key={id}
          type="button"
          disabled={disabled || busy != null}
          onClick={() => {
            setBusy(id);
            void signIn(id, {
              callbackUrl: `/${locale}/auth/continue`,
            });
          }}
          className="qt-btn flex w-full items-center justify-center gap-2 px-3 py-2.5 text-sm"
        >
          {id === "google" ? <GoogleMark /> : <GitHubMark />}
          {id === "google"
            ? t("continueWithGoogle")
            : t("continueWithGithub")}
        </button>
      ))}
    </div>
  );
}

/** @deprecated Use OAuthSignInButtons */
export function GoogleSignInButton(props: { disabled?: boolean }) {
  return <OAuthSignInButtons {...props} />;
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35.1 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.5 5.5-6.6 6.9l.1.1 6.3 5.3C39.5 37.3 44 31.5 44 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.28-.01-1.03-.02-2.02-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.28 0 .32.21.7.82.58C20.56 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0z" />
    </svg>
  );
}
