"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { SubmitButton } from "@/components/ui/submit-button";
import { SiteLogo } from "@/components/brand/site-logo";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const tApp = useTranslations("app");
  const tCommon = useTranslations("common");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        setError(t("forgotError"));
        return;
      }
      setDone(true);
    } catch {
      setError(t("forgotError"));
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

      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          {t("forgotTitle")}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
          {t("forgotHint")}
        </p>
      </div>

      {done ? (
        <div className="space-y-3">
          <p className="text-sm text-[var(--up)]">{t("forgotSent")}</p>
          <Link href="/login" className="text-sm text-[var(--brand-text)]">
            {t("backToLogin")}
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block space-y-1.5 text-sm">
            <div className="flex h-5 items-center">
              <span className="text-[var(--muted)]">{t("email")}</span>
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="qt-input h-11 w-full px-3.5 text-[15px] leading-none"
              disabled={loading}
            />
          </label>
          {error ? (
            <p className="text-sm text-[var(--danger)]">{error}</p>
          ) : null}
          <SubmitButton
            loading={loading}
            loadingLabel={tCommon("loading")}
            className="qt-btn qt-btn-primary mt-3 h-11 w-full px-4 text-[15px] font-semibold tracking-[-0.2px]"
          >
            {t("forgotSubmit")}
          </SubmitButton>
        </form>
      )}

      {!done ? (
        <p className="text-sm text-[var(--muted)]">
          <Link href="/login" className="text-[var(--brand-text)]">
            {t("backToLogin")}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
