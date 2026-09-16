"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/routing";
import { usePreference } from "@/components/providers/preference-provider";
import type { AppLocale } from "@/i18n/config";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const tAlerts = useTranslations("alerts");
  const locale = useLocale();
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const { theme, setTheme } = useTheme();
  const { changeColorScheme, setChangeColorScheme } = usePreference();
  const [lang, setLang] = useState<AppLocale>(locale as AppLocale);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLang(locale as AppLocale);
  }, [locale]);

  if (status === "loading") {
    return <p className="text-sm text-[var(--muted)]">…</p>;
  }

  if (!session?.user) {
    return (
      <div className="qt-panel p-6 text-sm">
        <p>{tAlerts("loginRequired")}</p>
        <Link href="/login" className="mt-3 inline-block text-[var(--brand-text)]">
          Login
        </Link>
      </div>
    );
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/user/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locale: lang,
        theme: theme === "light" || theme === "dark" ? theme : "system",
        changeColorScheme,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setMessage("Error");
      return;
    }
    await update({
      locale: lang,
      theme,
      changeColorScheme,
    });
    setMessage(t("saved"));
    if (lang !== locale) {
      router.replace("/settings", { locale: lang });
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <form onSubmit={onSave} className="qt-panel space-y-4 p-5 sm:p-6">
        <label className="block space-y-1 text-sm">
          <span className="text-[var(--muted)]">{t("language")}</span>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as AppLocale)}
            className="qt-input w-full px-3 py-2.5"
          >
            <option value="zh-CN">简体中文</option>
            <option value="zh-TW">繁體中文</option>
            <option value="en">English</option>
          </select>
        </label>

        <label className="block space-y-1 text-sm">
          <span className="text-[var(--muted)]">{t("theme")}</span>
          <select
            value={theme ?? "dark"}
            onChange={(e) => setTheme(e.target.value)}
            className="qt-input w-full px-3 py-2.5"
          >
            <option value="light">{t("themeLight")}</option>
            <option value="dark">{t("themeDark")}</option>
            <option value="system">{t("themeSystem")}</option>
          </select>
        </label>

        <label className="block space-y-1 text-sm">
          <span className="text-[var(--muted)]">{t("changeColor")}</span>
          <select
            value={changeColorScheme}
            onChange={(e) =>
              setChangeColorScheme(e.target.value as "cn" | "us")
            }
            className="qt-input w-full px-3 py-2.5"
          >
            <option value="cn">{t("changeCn")}</option>
            <option value="us">{t("changeUs")}</option>
          </select>
        </label>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-[var(--up)]">▲ Up</span>
          <span className="text-[var(--down)]">▼ Down</span>
        </div>

        {message && <p className="text-sm text-[var(--brand-text)]">{message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="qt-btn qt-btn-primary px-4 py-2.5 text-sm disabled:opacity-60"
        >
          {t("save")}
        </button>
      </form>
    </div>
  );
}
