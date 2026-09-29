"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { SubmitButton } from "@/components/ui/submit-button";
import { SiteLogo } from "@/components/brand/site-logo";

function ResetPasswordForm() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError(t("passwordMismatch"));
      return;
    }
    if (!token) {
      setError(t("resetInvalid"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error === "Invalid or expired token"
          ? t("resetInvalid")
          : t("resetError"));
        return;
      }
      router.push("/login?reset=1");
      router.refresh();
    } catch {
      setError(t("resetError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="qt-panel w-full space-y-5 p-6 sm:p-8">
      <div>
        <SiteLogo height={28} priority variant="compact" />
        <h1 className="mt-3 text-2xl font-semibold">{t("resetTitle")}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{t("resetHint")}</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--muted)]">{t("newPassword")}</span>
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
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--muted)]">{t("confirmPassword")}</span>
          <input
            type="password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
          {t("resetSubmit")}
        </SubmitButton>
      </form>
      <p className="text-sm text-[var(--muted)]">
        <Link href="/login" className="text-[var(--brand-text)]">
          {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--muted)]">…</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
