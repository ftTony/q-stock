"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import {
  usePreference,
  type ChangeColorScheme,
} from "@/components/providers/preference-provider";
import { SubmitButton } from "@/components/ui/submit-button";
import { QtSelect } from "@/components/ui/qt-select";
import { SETTINGS_SUBMIT_PRIMARY } from "@/components/settings/settings-btn";
import { useFlashMessage } from "@/components/settings/use-flash-message";
import { useSaveUserSettings } from "@/hooks/query/use-user-settings";
import {
  locales,
  languageLabels,
  localeCode,
  type AppLocale,
} from "@/i18n/config";

type ThemeId = "light" | "dark" | "system";

type GeneralFormValues = {
  locale: AppLocale;
  theme: ThemeId;
  changeColorScheme: ChangeColorScheme;
};

function SchemePreview({ scheme }: { scheme: ChangeColorScheme }) {
  const up = scheme === "cn" ? "#e11d48" : "#22c55e";
  const down = scheme === "cn" ? "#16a34a" : "#f87171";
  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: up }}
          aria-hidden
        />
        <span
          className="inline-block h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: down }}
          aria-hidden
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] tabular-nums">
        <span className="font-semibold" style={{ color: up }}>
          ▲ 128.50 +1.24%
        </span>
        <span className="font-semibold" style={{ color: down }}>
          ▼ 96.20 −0.85%
        </span>
      </div>
    </div>
  );
}

function ThemeOptionIcon({ id }: { id: ThemeId }) {
  const common = {
    className: "h-4 w-4 shrink-0 text-[var(--brand-text)]",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    "aria-hidden": true as const,
  };
  if (id === "light") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    );
  }
  if (id === "dark") {
    return (
      <svg {...common}>
        <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3a7 7 0 0 0 11.5 11.5z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

export function SettingsGeneralForm() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const { changeColorScheme, setChangeColorScheme } = usePreference();
  const saveSettings = useSaveUserSettings();
  const { message, messageKind, flash, clearFlash } = useFlashMessage();
  const loggedIn = Boolean(session?.user);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<GeneralFormValues>({
    defaultValues: {
      locale: locale as AppLocale,
      theme: (theme as ThemeId | undefined) ?? "system",
      changeColorScheme,
    },
  });

  useEffect(() => {
    reset({
      locale: locale as AppLocale,
      theme: (theme as ThemeId | undefined) ?? "system",
      changeColorScheme,
    });
  }, [locale, theme, changeColorScheme, reset]);

  useEffect(() => {
    try {
      const tip = sessionStorage.getItem("settings-flash");
      if (tip) {
        sessionStorage.removeItem("settings-flash");
        flash("ok", tip);
      }
    } catch {
      /* ignore */
    }
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(values: GeneralFormValues) {
    clearFlash();
    setChangeColorScheme(values.changeColorScheme);

    if (!loggedIn) {
      const tip = t("savedLocal");
      flash("ok", tip);
      if (values.locale !== locale) {
        try {
          sessionStorage.setItem("settings-flash", tip);
        } catch {
          /* ignore */
        }
        router.replace(pathname || "/markets", { locale: values.locale });
      }
      return;
    }

    try {
      await saveSettings.mutateAsync({
        locale: values.locale,
        theme:
          values.theme === "light" || values.theme === "dark"
            ? values.theme
            : "system",
        changeColorScheme: values.changeColorScheme,
      });
      await update({
        locale: values.locale,
        theme: values.theme,
        changeColorScheme: values.changeColorScheme,
      });
      const tip = t("saved");
      flash("ok", tip);
      if (values.locale !== locale) {
        try {
          sessionStorage.setItem("settings-flash", tip);
        } catch {
          /* ignore */
        }
        router.replace(pathname || "/markets", { locale: values.locale });
      }
    } catch {
      flash("error", t("saveError"));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <section className="space-y-2 border-b border-[var(--aw-hairline,var(--border))] pb-5">
        <h3 className="text-[13px] font-semibold text-[var(--foreground)]">
          {t("language")}
        </h3>
        <Controller
          name="locale"
          control={control}
          render={({ field }) => (
            <QtSelect
              value={field.value}
              onChange={(v) => field.onChange(v as AppLocale)}
              options={locales.map((l) => ({
                value: l,
                label: languageLabels[l],
                badge: localeCode(l),
              }))}
            />
          )}
        />
      </section>

      <section className="space-y-2 border-b border-[var(--aw-hairline,var(--border))] pb-5">
        <h3 className="text-[13px] font-semibold text-[var(--foreground)]">
          {t("theme")}
        </h3>
        <Controller
          name="theme"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(
                [
                  { id: "light" as const, label: t("themeLight") },
                  { id: "dark" as const, label: t("themeDark") },
                  { id: "system" as const, label: t("themeSystem") },
                ] as const
              ).map((opt) => {
                const selected = field.value === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      field.onChange(opt.id);
                      setTheme(opt.id);
                    }}
                    className={`flex items-center gap-2 rounded-none border px-3 py-2.5 text-left text-[13px] font-medium transition ${
                      selected
                        ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-text)]"
                        : "border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--sidebar-hover)]"
                    }`}
                  >
                    <ThemeOptionIcon id={opt.id} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}
        />
      </section>

      <section className="space-y-2 border-b border-[var(--aw-hairline,var(--border))] pb-5">
        <h3 className="text-[13px] font-semibold text-[var(--foreground)]">
          {t("changeColor")}
        </h3>
        <p className="text-[12px] leading-relaxed text-[var(--muted)]">
          {t("changeColorHint")}
        </p>
        <Controller
          name="changeColorScheme"
          control={control}
          render={({ field }) => (
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  { id: "cn" as const, label: t("changeCn") },
                  { id: "us" as const, label: t("changeUs") },
                ] as const
              ).map((opt) => {
                const selected = field.value === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      field.onChange(opt.id);
                      setChangeColorScheme(opt.id);
                    }}
                    className={`rounded-none border px-3 py-2.5 text-left transition ${
                      selected
                        ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                        : "border-[var(--border)] hover:bg-[var(--sidebar-hover)]"
                    }`}
                  >
                    <div className="text-[13px] font-medium text-[var(--foreground)]">
                      {opt.label}
                    </div>
                    <SchemePreview scheme={opt.id} />
                  </button>
                );
              })}
            </div>
          )}
        />
      </section>

      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        <SubmitButton
          loading={isSubmitting}
          loadingLabel={tCommon("loading")}
          className={SETTINGS_SUBMIT_PRIMARY}
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
  );
}
