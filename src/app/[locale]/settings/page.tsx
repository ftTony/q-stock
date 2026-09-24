"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/routing";
import {
  usePreference,
  type ChangeColorScheme,
} from "@/components/providers/preference-provider";
import { SubmitButton } from "@/components/ui/submit-button";
import { QtSelect } from "@/components/ui/qt-select";
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
    <div className="mt-2 flex items-center gap-3 text-sm tabular-nums">
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
    return <p className="text-sm text-[var(--muted)]">…</p>;
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    // Color scheme applies immediately via PreferenceProvider; persist locally always.
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
    <div className="w-full space-y-4 animate-[qtFade_0.45s_ease]">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      {!loggedIn && (
        <p className="text-sm text-[var(--muted)]">
          {t("guestHint")}{" "}
          <Link href="/login" className="qt-btn qt-btn-primary ml-2 inline-flex h-8 px-3 text-xs align-middle">
            {t("login")}
          </Link>
        </p>
      )}
      <form onSubmit={onSave} className="qt-panel w-full space-y-5 p-5 sm:p-6 lg:p-8">
        {loggedIn && (
          <label className="block space-y-1 text-sm">
            <span className="text-[var(--muted)]">{t("name")}</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={64}
              placeholder={session?.user?.email?.split("@")[0] || ""}
              className="qt-input w-full px-3 py-2.5"
            />
          </label>
        )}
        <div className="grid gap-5 lg:grid-cols-2 lg:gap-8">
          <label className="block space-y-1 text-sm">
            <span className="text-[var(--muted)]">{t("language")}</span>
            <QtSelect
              value={lang}
              onChange={(v) => setLang(v as AppLocale)}
              options={locales.map((l) => ({
                value: l,
                label: languageLabels[l],
                badge: localeCode(l),
              }))}
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="text-[var(--muted)]">{t("theme")}</span>
            <QtSelect
              value={theme ?? "dark"}
              onChange={(v) => setTheme(v)}
              options={[
                { value: "light", label: t("themeLight") },
                { value: "dark", label: t("themeDark") },
                { value: "system", label: t("themeSystem") },
              ]}
            />
          </label>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm text-[var(--muted)]">{t("changeColor")}</legend>
          <p className="text-xs text-[var(--muted)]">{t("changeColorHint")}</p>
          <div className="grid gap-3 sm:grid-cols-2">
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
                  className={`rounded-xl border p-3 text-left transition sm:p-4 ${
                    selected
                      ? "border-[var(--brand)] bg-[var(--brand-soft)] ring-1 ring-[var(--brand)]"
                      : "border-[var(--border)] hover:bg-[var(--sidebar-hover)]"
                  }`}
                >
                  <div className="text-sm font-medium">{opt.label}</div>
                  <SchemePreview scheme={opt.id} />
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton
            loading={saving}
            loadingLabel={tCommon("loading")}
            className="qt-btn-primary px-4 py-2.5 text-sm"
          >
            {t("save")}
          </SubmitButton>
          {message && (
            <p
              role="status"
              className="animate-[qtFade_0.25s_ease] rounded-lg px-3 py-2 text-sm"
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
    </div>
  );
}
