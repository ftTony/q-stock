"use client";

import { FormEvent, Suspense, useCallback, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { pathAfterAuth } from "@/lib/market/creds-status-client";
import { SubmitButton } from "@/components/ui/submit-button";
import { OAuthSignInButtons } from "@/components/auth/oauth-sign-in-buttons";
import { SiteLogo } from "@/components/brand/site-logo";

function LoginForm() {
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
      const next = await pathAfterAuth();
      router.push(next);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="qt-panel w-full space-y-5 p-6 sm:p-8">
      <div className="flex flex-col items-center gap-2">
        <SiteLogo height={44} priority variant="compact" />
        <p className="text-sm text-[var(--muted)]">{tApp("slogan")}</p>
      </div>
      {notice ? (
        <p className="text-sm text-[var(--up)]">{notice}</p>
      ) : null}
      {oauthError ? (
        <p className="text-sm text-[var(--danger)]">{t("oauthError")}</p>
      ) : null}
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--muted)]">{t("email")}</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="qt-input w-full px-3 py-2.5"
            disabled={formBusy}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[var(--muted)]">{t("password")}</span>
            <Link
              href="/forgot-password"
              className="text-xs text-[var(--brand-text)]"
            >
              {t("forgotPassword")}
            </Link>
          </div>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="qt-input w-full px-3 py-2.5"
            disabled={formBusy}
          />
        </label>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <SubmitButton
          loading={formBusy}
          loadingLabel={tCommon("loading")}
          className="qt-btn-primary w-full px-3 py-2.5 text-sm"
        >
          {t("submitLogin")}
        </SubmitButton>
      </form>
      <OAuthSignInButtons
        disabled={formBusy}
        onBusyChange={onOauthBusyChange}
      />
      <p className="text-sm text-[var(--muted)]">
        {t("noAccount")}{" "}
        <Link href="/register" className="text-[var(--brand-text)]">
          {t("registerTitle")}
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--muted)]">…</p>}>
      <LoginForm />
    </Suspense>
  );
}
