"use client";

import { FormEvent, useCallback, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { pathAfterAuth } from "@/lib/market/creds-status-client";
import { SubmitButton } from "@/components/ui/submit-button";
import { OAuthSignInButtons } from "@/components/auth/oauth-sign-in-buttons";
import { SiteLogo } from "@/components/brand/site-logo";

type Props = {
  /** Compact dialog — no logo chrome; stay on current page after credentials login. */
  variant?: "page" | "modal";
  onSuccess?: () => void;
  /** Modal: switch to register without navigation. */
  onSwitchToRegister?: () => void;
};

export function LoginForm({
  variant = "page",
  onSuccess,
  onSwitchToRegister,
}: Props) {
  const t = useTranslations("auth");
  const tApp = useTranslations("app");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthBusy, setOauthBusy] = useState(false);
  const modal = variant === "modal";

  const oauthError = searchParams.get("error");
  const notice =
    searchParams.get("reset") === "1"
      ? t("resetSuccess")
      : searchParams.get("registered") === "1"
        ? t("registered")
        : null;

  const onOauthBusyChange = useCallback((busy: boolean) => {
    setOauthBusy(busy);
  }, []);

  const formBusy = loading || oauthBusy;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError(t("error"));
        return;
      }
      if (modal) {
        onSuccess?.();
        router.refresh();
        return;
      }
      const next = await pathAfterAuth();
      router.push(next);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    "qt-input h-11 w-full px-3.5 text-[15px] leading-none";
  const submitClass =
    "qt-btn qt-btn-primary mt-3 h-11 w-full px-4 text-[15px] font-semibold tracking-[-0.2px]";
  const labelClass = "block space-y-1.5 text-sm";

  return (
    <div
      className={
        modal ? "w-full space-y-5" : "qt-panel w-full space-y-5 p-6 sm:p-8"
      }
    >
      {!modal ? (
        <Link
          href="/"
          className="flex flex-col items-center gap-2 rounded-lg outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--brand)]/40"
        >
          <SiteLogo height={44} priority variant="compact" />
          <p className="text-sm text-[var(--muted)]">{tApp("slogan")}</p>
        </Link>
      ) : null}
      {!modal && notice ? (
        <p className="text-sm text-[var(--up)]">{notice}</p>
      ) : null}
      {!modal && oauthError ? (
        <p className="text-sm text-[var(--danger)]">{t("oauthError")}</p>
      ) : null}
      <form onSubmit={onSubmit} className="space-y-4">
        <label className={labelClass}>
          <div className="flex h-5 items-center">
            <span className="text-[var(--muted)]">{t("email")}</span>
          </div>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
            disabled={formBusy}
          />
        </label>
        <label className={labelClass}>
          <div className="flex h-5 items-center justify-between gap-2">
            <span className="text-[var(--muted)]">{t("password")}</span>
            <Link
              href="/forgot-password"
              className={
                modal
                  ? "text-[12px] text-[var(--muted)] hover:text-[var(--brand-text)]"
                  : "text-xs text-[var(--brand-text)]"
              }
              onClick={modal ? onSuccess : undefined}
            >
              {t("forgotPassword")}
            </Link>
          </div>
          <input
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClass}
            disabled={formBusy}
          />
        </label>
        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
        <SubmitButton
          loading={formBusy}
          loadingLabel={tCommon("loading")}
          className={submitClass}
        >
          {t("submitLogin")}
        </SubmitButton>
      </form>
      <OAuthSignInButtons
        disabled={formBusy}
        onBusyChange={onOauthBusyChange}
        callbackUrl={
          modal && typeof window !== "undefined"
            ? window.location.href
            : undefined
        }
      />
      <p
        className={
          modal
            ? "text-center text-[13px] text-[var(--muted)]"
            : "text-sm text-[var(--muted)]"
        }
      >
        {t("noAccount")}{" "}
        {modal && onSwitchToRegister ? (
          <button
            type="button"
            className="font-medium text-[var(--brand-text)]"
            onClick={onSwitchToRegister}
          >
            {t("registerTitle")}
          </button>
        ) : (
          <Link href="/register" className="font-medium text-[var(--brand-text)]">
            {t("registerTitle")}
          </Link>
        )}
      </p>
    </div>
  );
}
