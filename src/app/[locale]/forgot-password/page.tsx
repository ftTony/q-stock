"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { SubmitButton } from "@/components/ui/submit-button";

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
      <div>
        <div className="text-xs tracking-[0.18em] text-[var(--brand-text)] uppercase">
          {tApp("name")}
        </div>
        <h1 className="mt-2 text-2xl font-semibold">{t("forgotTitle")}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{t("forgotHint")}</p>
      </div>

      {done ? (
        <div className="space-y-4">
          <p className="text-sm text-[var(--up)]">{t("forgotSent")}</p>
          <Link href="/login" className="text-sm text-[var(--brand-text)]">
            {t("backToLogin")}
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block space-y-1 text-sm">
            <span className="text-[var(--muted)]">{t("email")}</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="qt-input w-full px-3 py-2.5"
              disabled={loading}
            />
          </label>
          {error && <p className="text-sm text-[var(--down)]">{error}</p>}
          <SubmitButton
            loading={loading}
            loadingLabel={tCommon("loading")}
            className="qt-btn-primary w-full px-3 py-2.5 text-sm"
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
