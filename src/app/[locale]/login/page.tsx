"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { pathAfterAuth } from "@/lib/market/creds-status-client";
import { SubmitButton } from "@/components/ui/submit-button";

export default function LoginPage() {
  const t = useTranslations("auth");
  const tApp = useTranslations("app");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      <div>
        <div className="text-xs tracking-[0.18em] text-[var(--brand-text)] uppercase">
          {tApp("name")}
        </div>
        <h1 className="mt-2 text-2xl font-semibold">{t("loginTitle")}</h1>
      </div>
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
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--muted)]">{t("password")}</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {t("submitLogin")}
        </SubmitButton>
      </form>
      <p className="text-sm text-[var(--muted)]">
        {t("noAccount")}{" "}
        <Link href="/register" className="text-[var(--brand-text)]">
          {t("registerTitle")}
        </Link>
      </p>
      <p className="hidden text-xs">{locale}</p>
    </div>
  );
}
