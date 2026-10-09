"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

/** Light theme → logo-light; otherwise logo-dark */
export function brandMarkSrc(
  theme: string | undefined,
): "/logo-light.png" | "/logo-dark.png" {
  return theme === "light" ? "/logo-light.png" : "/logo-dark.png";
}

type SiteLogoProps = {
  className?: string;
  /** Icon mark height in px. */
  height?: number;
  priority?: boolean;
  /** full = screenshot lockup; compact = icon + name; mark = icon only. */
  variant?: "full" | "compact" | "mark";
};

export function SiteLogo({
  className = "",
  height = 48,
  priority = false,
  variant = "full",
}: SiteLogoProps) {
  const tApp = useTranslations("app");
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setImgFailed(false);
  }, [resolvedTheme]);

  // Avoid hydration mismatch: default to light mark until mounted (site default).
  const themed = brandMarkSrc(mounted ? resolvedTheme : "light");
  const src = imgFailed ? "/logo.png" : themed;

  return (
    <span
      className={`inline-flex min-w-0 items-center gap-2.5 ${className}`}
      aria-label={tApp("name")}
    >
      {/* Native img avoids next/image optimizer failures on small brand marks */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={height}
        height={height}
        decoding="async"
        {...(priority ? { fetchPriority: "high" as const } : {})}
        className="shrink-0 object-contain"
        style={{ height, width: height }}
        onError={() => setImgFailed(true)}
      />

      {variant === "mark" ? null : variant === "compact" ? (
        <span
          className="truncate font-bold tracking-tight text-[var(--foreground)]"
          style={{ fontSize: Math.max(16, Math.round(height * 0.55)) }}
        >
          {tApp("name")}
        </span>
      ) : (
        <span className="inline-flex max-w-full flex-col gap-1.5">
          <span className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-[16px] font-bold leading-none tracking-tight text-[var(--foreground)]">
              {tApp("name")}
            </span>
            <span
              className="h-3.5 w-px shrink-0 bg-[var(--border)]"
              aria-hidden
            />
            <span className="text-[12px] font-medium leading-none text-[var(--muted)]">
              {tApp("domain")}
            </span>
          </span>
          <span className="whitespace-nowrap pl-[2px] text-[11px] font-medium leading-none text-[var(--muted)]">
            {tApp("slogan")}
          </span>
        </span>
      )}
    </span>
  );
}
