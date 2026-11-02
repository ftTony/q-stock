"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import {
  usePreference,
} from "@/components/providers/preference-provider";
import { SubmitButton } from "@/components/ui/submit-button";
import { SETTINGS_SUBMIT_PRIMARY } from "@/components/settings/settings-btn";
import { useFlashMessage } from "@/components/settings/use-flash-message";
import { useSaveUserSettings } from "@/hooks/query/use-user-settings";

type AccountNameValues = {
  displayName: string;
};

export function SettingsAccountNameForm() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { data: session, update } = useSession();
  const { theme } = useTheme();
  const { changeColorScheme } = usePreference();
  const saveSettings = useSaveUserSettings();
  const { message, messageKind, flash, clearFlash } = useFlashMessage();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<AccountNameValues>({
    defaultValues: {
      displayName: session?.user?.name?.trim() || "",
    },
  });

  useEffect(() => {
    reset({ displayName: session?.user?.name?.trim() || "" });
  }, [session?.user?.name, reset]);

  async function onSubmit(values: AccountNameValues) {
    clearFlash();
    try {
      const data = await saveSettings.mutateAsync({
        name: values.displayName.trim() || undefined,
        locale,
        theme: theme === "light" || theme === "dark" ? theme : "system",
        changeColorScheme,
      });
      await update({
        name: (data.user?.name ?? values.displayName.trim()) || null,
        locale,
        theme,
        changeColorScheme,
      });
      flash("ok", t("saved"));
    } catch {
      flash("error", t("saveError"));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pb-4">
      <label className="block space-y-2 text-sm">
        <span className="block leading-snug text-[var(--muted)]">
          {t("name")}
        </span>
        <input
          {...register("displayName", { maxLength: 64 })}
          maxLength={64}
          placeholder={session?.user?.email?.split("@")[0] || ""}
          className="qt-input h-9 w-full px-3 text-[14px] leading-none"
        />
      </label>
      <div className="flex flex-wrap items-center gap-2.5">
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
