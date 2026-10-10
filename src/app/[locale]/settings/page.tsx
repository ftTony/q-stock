"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/routing";
import {
  usePreference,
  type ChangeColorScheme,
} from "@/components/providers/preference-provider";
import { SubmitButton } from "@/components/ui/submit-button";
import { PanelSkeleton } from "@/components/ui/panel-skeleton";
import { QtSelect } from "@/components/ui/qt-select";
import { MarketCredentialsForm } from "@/components/settings/market-credentials-form";
import { MarketOkxCredentialsForm } from "@/components/settings/market-okx-credentials-form";
import { MarketVendorPrefs } from "@/components/settings/market-vendor-prefs";
import { AiCredentialsForm } from "@/components/settings/ai-credentials-form";
import { InvitePanel } from "@/components/settings/invite-panel";
import {
  locales,
  languageLabels,
  localeCode,
  type AppLocale,
} from "@/i18n/config";

function SchemePreview({ scheme }: { scheme: ChangeColorScheme }) {
  const up = scheme === "cn" ? "#e11d48" : "#22c55e";
  const down = scheme === "cn" ? "#16a34a" : "#f87171";
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] tabular-nums">
      <span className="font-semibold" style={{ color: up }}>
        ▲ 128.50 +1.24%
      </span>
      <span className="font-semibold" style={{ color: down }}>
        ▼ 96.20 −0.85%
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const { theme, setTheme } = useTheme();
  const { changeColorScheme, setChangeColorScheme } = usePreference();
  const [lang, setLang] = useState<AppLocale>(locale as AppLocale);
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<"ok" | "error">("ok");
  const [saving, setSaving] = useState(false);
  const loggedIn = Boolean(session?.user);

  useEffect(() => {
    setLang(locale as AppLocale);
  }, [locale]);

  useEffect(() => {
    setDisplayName(session?.user?.name?.trim() || "");
  }, [session?.user?.name]);

  useEffect(() => {
    try {
      const flash = sessionStorage.getItem("settings-flash");
      if (flash) {
        sessionStorage.removeItem("settings-flash");
        setMessageKind("ok");
        setMessage(flash);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [message]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="h-7 w-28 animate-pulse rounded bg-[var(--surface-2)]" />
        <div className="grid gap-4 lg:grid-cols-2">
          <PanelSkeleton rows={4} label={tCommon("loading")} />
          <PanelSkeleton rows={3} label={tCommon("loading")} />
        </div>
        <PanelSkeleton rows={3} label={tCommon("loading")} />
      </div>
    );
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    setChangeColorScheme(changeColorScheme);

    if (!loggedIn) {
      setSaving(false);
      const tip = t("savedLocal");
      setMessageKind("ok");
      setMessage(tip);
      if (lang !== locale) {
        try {
          sessionStorage.setItem("settings-flash", tip);
        } catch {
          /* ignore */
        }
        router.replace("/settings", { locale: lang });
      }
      return;
    }

    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: displayName.trim() || undefined,
          locale: lang,
          theme: theme === "light" || theme === "dark" ? theme : "system",
          changeColorScheme,
        }),
      });
      if (!res.ok) {
        setMessageKind("error");
        setMessage(t("saveError"));
        return;
      }
      const data = await res.json();
      await update({
        name: (data.user?.name ?? displayName.trim()) || null,
        locale: lang,
        theme,
        changeColorScheme,
      });
      const tip = t("saved");
      setMessageKind("ok");
      setMessage(tip);
      if (lang !== locale) {
        try {
          sessionStorage.setItem("settings-flash", tip);
        } catch {
          /* ignore */
        }
        router.replace("/settings", { locale: lang });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="settings-ui mx-auto max-w-6xl space-y-5 animate-[qtFade_0.45s_ease]">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {t("title")}
        </h1>
        {!loggedIn && (
          <p className="text-xs text-[var(--muted)] sm:text-sm">
            {t("guestHint")}{" "}
            <Link
              href="/login"
              className="qt-btn qt-btn-primary ml-1.5 inline-flex h-9 px-3 align-middle"
            >
              {t("login")}
            </Link>
          </p>
        )}
      </header>

      <div
        className={`grid gap-4 ${
          loggedIn
            ? "lg:grid-cols-2 lg:items-stretch"
            : ""
        }`}
      >
        <section className="qt-panel flex h-full flex-col overflow-hidden">
          <form onSubmit={onSave} className="flex flex-1 flex-col gap-3.5 p-4">
            {loggedIn && (
              <label className="block space-y-1.5 text-sm">
                <span className="block text-[var(--muted)]">{t("name")}</span>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={64}
                  placeholder={session?.user?.email?.split("@")[0] || ""}
                  className="qt-input h-9 w-full px-3 text-[14px] leading-none"
                />
              </label>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 text-sm">
                <span className="block text-[var(--muted)]">{t("language")}</span>
                <QtSelect
                  value={lang}
                  onChange={(v) => setLang(v as AppLocale)}
                  options={locales.map((l) => ({
                    value: l,
                    label: languageLabels[l],
                    badge: localeCode(l),
                  }))}
                />
              </div>
              <div className="space-y-1.5 text-sm">
                <span className="block text-[var(--muted)]">{t("theme")}</span>
                <QtSelect
                  value={theme ?? "dark"}
                  onChange={(v) => setTheme(v)}
                  options={[
                    { value: "light", label: t("themeLight") },
                    { value: "dark", label: t("themeDark") },
                    { value: "system", label: t("themeSystem") },
                  ]}
                />
              </div>
            </div>

            <fieldset className="space-y-1.5">
              <legend className="text-sm text-[var(--muted)]">
                {t("changeColor")}
              </legend>
              <p className="text-[11px] leading-relaxed text-[var(--muted)]">
                {t("changeColorHint")}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    { id: "cn" as const, label: t("changeCn") },
                    { id: "us" as const, label: t("changeUs") },
                  ] as const
                ).map((opt) => {
                  const selected = changeColorScheme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setChangeColorScheme(opt.id)}
                      className={`rounded-lg border px-3 py-2 text-left transition ${
                        selected
                          ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                          : "border-[var(--border)] hover:bg-[var(--sidebar-hover)]"
                      }`}
                    >
                      <div className="text-[14px] font-medium">{opt.label}</div>
                      <SchemePreview scheme={opt.id} />
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-1">
              <SubmitButton
                loading={saving}
                loadingLabel={tCommon("loading")}
                className="qt-btn qt-btn-primary h-9 px-4"
              >
                {t("save")}
              </SubmitButton>
              {message && (
                <p
                  role="status"
                  className="animate-[qtFade_0.25s_ease] rounded-md px-2.5 py-1 text-xs"
                  style={
                    messageKind === "ok"
                      ? {
                          background:
                            "color-mix(in srgb, var(--up) 12%, transparent)",
                          color: "var(--up)",
                        }
                      : {
                          background:
                            "color-mix(in srgb, var(--down) 12%, transparent)",
                          color: "var(--down)",
                        }
                  }
                >
                  {messageKind === "ok" ? "✓ " : ""}
                  {message}
                </p>
              )}
            </div>
          </form>
        </section>

        {loggedIn ? <InvitePanel /> : null}
      </div>

      {loggedIn ? (
        <>
          <MarketVendorPrefs />
          <Suspense
            fallback={<PanelSkeleton rows={4} label={tCommon("loading")} />}
          >
            <MarketCredentialsForm />
          </Suspense>
          <MarketOkxCredentialsForm />
          <AiCredentialsForm />
        </>
      ) : null}
    </div>
  );
}
