"use client";

import { useMemo, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import type { TipLabels } from "@/components/charts/candle-chart-styles";

/** Locale/theme-aware brand + tip labels for chart chrome / screenshot. */
export function useCandleChartBrand() {
  const { resolvedTheme } = useTheme();
  const locale = useLocale();
  const t = useTranslations("symbol");
  const tApp = useTranslations("app");

  const domainRef = useRef(tApp("domain"));
  domainRef.current = tApp("domain");
  /** Corner mark follows locale (`app.name`: 钱力股 / 錢力股 / Qianli Gu / …). */
  const brandRef = useRef(tApp("name"));
  brandRef.current = tApp("name");
  const taglineRef = useRef(tApp("tagline"));
  taglineRef.current = tApp("tagline");
  const logoSrcRef = useRef("/logo-light.png?v=2");
  // logo-en carries a dark square backdrop (light-theme only); on a dark
  // footer use the transparent mark so it stays legible on any background.
  logoSrcRef.current =
    resolvedTheme === "dark"
      ? "/logo-light.png?v=2"
      : locale.startsWith("zh")
        ? "/logo-cn.png?v=2"
        : locale.startsWith("en")
          ? "/logo-en.png?v=2"
          : "/logo-light.png?v=2";

  const tipLabels = useMemo<TipLabels>(
    () => ({
      time: t("time"),
      open: t("open"),
      high: t("high"),
      low: t("low"),
      close: t("close"),
      volume: t("volume"),
    }),
    [t],
  );
  const tipLabelsRef = useRef<TipLabels>(tipLabels);
  tipLabelsRef.current = tipLabels;

  return {
    locale,
    resolvedTheme,
    domainRef,
    brandRef,
    taglineRef,
    logoSrcRef,
    tipLabels,
    tipLabelsRef,
  };
}
