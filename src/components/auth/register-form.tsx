"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { pathAfterAuth } from "@/lib/market/creds-status-client";
import { SubmitButton } from "@/components/ui/submit-button";
import { OAuthSignInButtons } from "@/components/auth/oauth-sign-in-buttons";
import { SiteLogo } from "@/components/brand/site-logo";

type Props = {
  variant?: "page" | "modal";
  onSuccess?: () => void;
  /** Modal: switch back to login without navigation. */
  onSwitchToLogin?: () => void;
};

export function RegisterForm({
  variant = "page",
  onSuccess,
  onSwitchToLogin,
}: Props) {
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
  const modal = variant === "modal";

  const onOauthBusyChange = useCallback((busy: boolean) => {
    setOauthBusy(busy);
  }, []);

  const formBusy = loading || oauthBusy;

  useEffect(() => {
    if (modal) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const invite = params.get("invite")?.trim();
      if (invite) setInviteCode(invite);
    } catch {
      /* ignore */
    }
  }, [modal]);

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
        if (modal) {
          onSwitchToLogin?.();
          return;
        }
        router.push("/login?registered=1");
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

  const fieldClass = modal
    ? "qt-input h-11 w-full px-3.5 text-[15px] leading-none"
    : "qt-input w-full px-3 py-2.5";
  const submitClass = modal
    ? "qt-btn-primary mt-1 h-11 w-full px-4 text-[15px] font-semibold tracking-[-0.2px]"
    : "qt-btn-primary w-full px-3 py-2.5 text-sm";
  const labelClass = modal
    ? "block space-y-1.5 text-[13px]"
    : "block space-y-1 text-sm";

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
      <form onSubmit={onSubmit} className={modal ? "space-y-4" : "space-y-3"}>
        <label className={labelClass}>
          <span className="text-[var(--muted)]">{t("name")}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
            disabled={formBusy}
            autoComplete="nickname"
          />
        </label>
        <label className={labelClass}>
          <span className="text-[var(--muted)]">{t("email")}</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
            disabled={formBusy}
            autoComplete="email"
          />
        </label>
        <label className={labelClass}>
          <span className="text-[var(--muted)]">{t("password")}</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClass}
            disabled={formBusy}
            autoComplete="new-password"
          />
        </label>
        <label className={labelClass}>
          <span className="text-[var(--muted)]">{t("inviteCode")}</span>
          <input
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className={`${fieldClass} font-mono`}
            disabled={formBusy}
            autoComplete="off"
            spellCheck={false}
            placeholder={t("inviteCodeOptional")}
          />
        </label>
        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
        <SubmitButton
          loading={formBusy}
          loadingLabel={tCommon("loading")}
          className={submitClass}
        >
          {t("submitRegister")}
        </SubmitButton>
        <p className="text-center text-[12px] leading-relaxed text-[var(--muted)]">
          {t("consentLead")}{" "}
          <Link
            href="/terms"
            className="font-medium !text-[var(--brand-text)] underline underline-offset-2 hover:opacity-90"
          >
            {t("consentTerms")}
          </Link>{" "}
          {t("consentAnd")}{" "}
          <Link
            href="/privacy"
            className="font-medium !text-[var(--brand-text)] underline underline-offset-2 hover:opacity-90"
          >
            {t("consentPrivacy")}
          </Link>
        </p>
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
        {t("haveAccount")}{" "}
        {modal && onSwitchToLogin ? (
          <button
            type="button"
            className="font-medium text-[var(--brand-text)]"
            onClick={onSwitchToLogin}
          >
            {t("loginTitle")}
          </button>
        ) : (
          <Link href="/login" className="font-medium text-[var(--brand-text)]">
            {t("loginTitle")}
          </Link>
        )}
      </p>
    </div>
  );
}
