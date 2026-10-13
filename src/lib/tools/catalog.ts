export type ToolSlug =
  | "position"
  | "dca"
  | "compound"
  | "options"
  | "mortgage"
  | "risk-reward";

export type ToolMeta = {
  slug: ToolSlug;
  href: `/tools/${ToolSlug}`;
  /**
   * Key under `tools.*` / `tools.cards.*`.
   * Defaults to `slug`. Use camelCase when the slug contains `-`
   * (next-intl path lookups with hyphens are unreliable in some versions).
   */
  messageKey?: string;
};

export const TOOL_CATALOG: ToolMeta[] = [
  { slug: "position", href: "/tools/position" },
  {
    slug: "risk-reward",
    href: "/tools/risk-reward",
    messageKey: "riskReward",
  },
  { slug: "dca", href: "/tools/dca" },
  { slug: "compound", href: "/tools/compound" },
  { slug: "options", href: "/tools/options" },
  { slug: "mortgage", href: "/tools/mortgage" },
];

export function getToolMeta(slug: string): ToolMeta | null {
  return TOOL_CATALOG.find((t) => t.slug === slug) ?? null;
}

/** i18n key for a tool (card + detail namespace). */
export function toolMessageKey(slugOrMeta: ToolSlug | ToolMeta): string {
  const meta =
    typeof slugOrMeta === "string" ? getToolMeta(slugOrMeta) : slugOrMeta;
  return meta?.messageKey ?? meta?.slug ?? String(slugOrMeta);
}

export function formatToolNumber(
  value: number,
  digits = 2,
): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}
