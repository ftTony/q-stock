import type { ReactNode } from "react";

type Tone = "info" | "trust";

const TONE: Record<Tone, string> = {
  /** Failover / how-it-works notes under controls. */
  info: "border-[color-mix(in_srgb,var(--brand)_28%,var(--border))] bg-[var(--brand-soft)] text-[var(--brand-text)]",
  /** Privacy / encryption reassurance. */
  trust:
    "border-[color-mix(in_srgb,var(--up)_28%,var(--border))] bg-[color-mix(in_srgb,var(--up)_10%,var(--panel))] text-[color-mix(in_srgb,var(--up)_75%,var(--foreground))]",
};

/** Colored callout for settings helper copy (keeps forms from looking flat). */
export function SettingsHint({
  children,
  tone = "info",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <p
      className={`rounded-md border px-2.5 py-2 text-[12px] leading-relaxed tracking-[-0.08px] ${TONE[tone]} ${className}`}
    >
      {children}
    </p>
  );
}
