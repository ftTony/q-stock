"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { pathAfterAuth } from "@/lib/market/creds-status-client";
import { SubmitButton } from "@/components/ui/submit-button";
import { OAuthSignInButtons } from "@/components/auth/oauth-sign-in-buttons";
import { SiteLogo } from "@/components/brand/site-logo";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const tApp = useTranslations("app");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthBusy, setOauthBusy] = useState(false);

  const onOauthBusyChange = useCallback((busy: boolean) => {
    setOauthBusy(busy);
  }, []);

  const formBusy = loading || oauthBusy;

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const invite = params.get("invite")?.trim();
      if (invite) setInviteCode(invite);
    } catch {
      /* ignore */
    }
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: name || undefined,
          locale,
          inviteCode: inviteCode.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "Invalid or used invite code") {
          setError(t("inviteInvalid"));
        } else if (data.error === "Email already registered") {
          setError(t("emailTaken"));
        } else {
          setError(data.error || t("error"));
        }
        return;
      }
      const signed = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signed?.error) {
        router.push("/login?registered=1");
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
      <Link
        href="/"
        className="flex flex-col items-center gap-2 rounded-lg outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--brand)]/40"
      >
        <SiteLogo height={44} priority variant="compact" />
        <p className="text-sm text-[var(--muted)]">{tApp("slogan")}</p>
      </Link>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--muted)]">{t("name")}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="qt-input w-full px-3 py-2.5"
            disabled={formBusy}
          />
        </label>
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
          <span className="text-[var(--muted)]">{t("password")}</span>
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
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--muted)]">{t("inviteCode")}</span>
          <input
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="qt-input w-full px-3 py-2.5 font-mono"
            disabled={formBusy}
            autoComplete="off"
            spellCheck={false}
            placeholder={t("inviteCodeOptional")}
          />
        </label>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <SubmitButton
          loading={formBusy}
          loadingLabel={tCommon("loading")}
          className="qt-btn-primary w-full px-3 py-2.5 text-sm"
        >
          {t("submitRegister")}
        </SubmitButton>
      </form>
      <OAuthSignInButtons
        disabled={formBusy}
        onBusyChange={onOauthBusyChange}
      />
      <p className="text-sm text-[var(--muted)]">
        {t("haveAccount")}{" "}
        <Link href="/login" className="text-[var(--brand-text)]">
          {t("loginTitle")}
        </Link>
      </p>
    </div>
  );
}
