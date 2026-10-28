"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, Link } from "@/i18n/routing";
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
import { BillingPanel } from "@/components/settings/billing-panel";
import { InvitePanel } from "@/components/settings/invite-panel";
import { PaperRiskSettingsForm } from "@/components/settings/paper-risk-settings-form";
import { SettingsAboutPanel } from "@/components/settings/settings-about-panel";
import { PushNotifySettings } from "@/components/settings/push-notify-settings";
import { AuthLoginGate } from "@/components/auth/auth-login-gate";
import { useLoginModalOptional } from "@/components/auth/login-modal-context";
import { useSaveUserSettings } from "@/hooks/query/use-user-settings";
import {
  locales,
  languageLabels,
  localeCode,
  type AppLocale,
} from "@/i18n/config";

export type SettingsSection =
  | "general"
  | "trading"
  | "market"
  | "account"
  | "about";

const GUEST_SECTIONS: SettingsSection[] = ["general", "about"];

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

function LoginCta({
  className,
  label,
}: {
  className?: string;
  label: string;
}) {
  const loginModal = useLoginModalOptional();
  if (loginModal) {
    return (
      <button type="button" className={className} onClick={loginModal.openLogin}>
        {label}
      </button>
    );
  }
  return (
    <Link href="/login" className={className}>
      {label}
    </Link>
  );
}

type Props = {
  section: SettingsSection;
  setupKeys?: boolean;
  onSetupKeysDone?: () => void;
};

export function SettingsPanel({
  section,
  setupKeys = false,
  onSetupKeysDone,
}: Props) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const { theme, setTheme } = useTheme();
  const { changeColorScheme, setChangeColorScheme } = usePreference();
  const [lang, setLang] = useState<AppLocale>(locale as AppLocale);
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<"ok" | "error">("ok");
  const [saving, setSaving] = useState(false);
  const saveSettings = useSaveUserSettings();
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
    return <PanelSkeleton rows={4} label={tCommon("loading")} />;
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
        router.replace(pathname || "/markets", { locale: lang });
      }
      return;
    }

    try {
      const data = await saveSettings.mutateAsync({
        name: displayName.trim() || undefined,
        locale: lang,
        theme: theme === "light" || theme === "dark" ? theme : "system",
        changeColorScheme,
      });
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
        router.replace(pathname || "/markets", { locale: lang });
      }
    } catch {
      setMessageKind("error");
      setMessage(t("saveError"));
    } finally {
      setSaving(false);
    }
  }

  if (!GUEST_SECTIONS.includes(section) && !loggedIn) {
    return (
      <div className="flex h-full min-h-[18rem] flex-1 flex-col items-center justify-center px-4 py-8">
        <AuthLoginGate
          compact
          title={t("loginToSection")}
          body={t("guestLockedHint")}
          hint=""
        />
      </div>
    );
  }

  if (section === "about") {
    return <SettingsAboutPanel />;
  }

  if (section === "trading") {
    return (
      <div className="settings-ui">
        <PaperRiskSettingsForm />
      </div>
    );
  }

  if (section === "market") {
    return (
      <div className="settings-ui space-y-5">
        <MarketVendorPrefs />
        <Suspense
          fallback={<PanelSkeleton rows={4} label={tCommon("loading")} />}
        >
          <MarketCredentialsForm
            forceSetupKeys={setupKeys}
            onSetupKeysDone={onSetupKeysDone}
          />
        </Suspense>
        <MarketOkxCredentialsForm />
      </div>
    );
  }

  if (section === "account") {
    return (
      <div className="settings-ui space-y-0">
        <form onSubmit={onSave} className="space-y-3.5 pb-4">
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
          <div className="flex flex-wrap items-center gap-2.5">
            <SubmitButton
              loading={saving}
              loadingLabel={tCommon("loading")}
              className="qt-btn qt-btn-primary h-9 px-4"
            >
              {t("save")}
            </SubmitButton>
            {message ? (
              <p
                role="status"
                className="text-xs"
                style={{
                  color: messageKind === "ok" ? "var(--up)" : "var(--down)",
                }}
              >
                {messageKind === "ok" ? "✓ " : ""}
                {message}
              </p>
            ) : null}
          </div>
        </form>
        <section className="space-y-1.5 border-t border-[var(--aw-hairline,var(--border))] pt-4">
          <h2 className="text-[15px] font-semibold tracking-[-0.2px]">
            {t("freemiumTitle")}
          </h2>
          <p className="text-[13px] leading-relaxed text-[var(--muted)]">
            {t("freemiumBody")}
          </p>
          <ul className="space-y-1 text-[13px] leading-relaxed text-[var(--muted)]">
            <li>
              <span className="font-medium text-[var(--foreground)]">
                {t("freemiumInvite")}
              </span>
              {" — "}
              {t("freemiumInviteBody")}
            </li>
            <li>
              <span className="font-medium text-[var(--foreground)]">
                {t("freemiumByok")}
              </span>
              {" — "}
              {t("freemiumByokBody")}
            </li>
            <li>
              <span className="font-medium text-[var(--foreground)]">
                {t("freemiumPro")}
              </span>
              {" — "}
              {t("freemiumProBody")}
            </li>
          </ul>
        </section>
        <BillingPanel />
        <InvitePanel />
        <PushNotifySettings />
        <AiCredentialsForm />
      </div>
    );
  }

  // general
  return (
    <div className="settings-ui">
      {!loggedIn ? (
        <p className="mb-4 text-[13px] text-[var(--muted)]">
          {t("guestHint")}{" "}
          <LoginCta
            label={t("login")}
            className="font-medium text-[var(--brand-text)]"
          />
        </p>
      ) : null}
      <form onSubmit={onSave} className="space-y-5">
        <section className="space-y-2 border-b border-[var(--aw-hairline,var(--border))] pb-5">
          <h3 className="text-[13px] font-semibold text-[var(--foreground)]">
            {t("language")}
          </h3>
          <QtSelect
            value={lang}
            onChange={(v) => setLang(v as AppLocale)}
            options={locales.map((l) => ({
              value: l,
              label: languageLabels[l],
              badge: localeCode(l),
            }))}
          />
        </section>

        <section className="space-y-2 border-b border-[var(--aw-hairline,var(--border))] pb-5">
          <h3 className="text-[13px] font-semibold text-[var(--foreground)]">
            {t("theme")}
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(
              [
                { id: "light", label: t("themeLight") },
                { id: "dark", label: t("themeDark") },
                { id: "system", label: t("themeSystem") },
              ] as const
            ).map((opt) => {
              const selected = (theme ?? "system") === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTheme(opt.id)}
                  className={`rounded-none border px-3 py-2.5 text-left text-[13px] font-medium transition ${
                    selected
                      ? "border-[var(--foreground)] bg-[var(--panel)]"
                      : "border-[var(--border)] hover:bg-[var(--sidebar-hover)]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-2 border-b border-[var(--aw-hairline,var(--border))] pb-5">
          <h3 className="text-[13px] font-semibold text-[var(--foreground)]">
            {t("changeColor")}
          </h3>
          <p className="text-[12px] leading-relaxed text-[var(--muted)]">
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
                  className={`rounded-none border px-3 py-2.5 text-left transition ${
                    selected
                      ? "border-[var(--foreground)]"
                      : "border-[var(--border)] hover:bg-[var(--sidebar-hover)]"
                  }`}
                >
                  <div className="text-[13px] font-medium">{opt.label}</div>
                  <SchemePreview scheme={opt.id} />
                </button>
              );
            })}
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <SubmitButton
            loading={saving}
            loadingLabel={tCommon("loading")}
            className="qt-btn qt-btn-primary h-9 px-4"
          >
            {t("save")}
          </SubmitButton>
          {message ? (
            <p
              role="status"
              className="text-xs"
              style={{
                color: messageKind === "ok" ? "var(--up)" : "var(--down)",
              }}
            >
              {messageKind === "ok" ? "✓ " : ""}
              {message}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
