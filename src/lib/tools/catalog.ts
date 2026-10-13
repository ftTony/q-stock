export type ToolSlug = "position" | "dca" | "compound" | "options";

export type ToolMeta = {
  slug: ToolSlug;
  href: `/tools/${ToolSlug}`;
};

export const TOOL_CATALOG: ToolMeta[] = [
  { slug: "position", href: "/tools/position" },
  { slug: "dca", href: "/tools/dca" },
  { slug: "compound", href: "/tools/compound" },
  { slug: "options", href: "/tools/options" },
];

export function getToolMeta(slug: string): ToolMeta | null {
  return TOOL_CATALOG.find((t) => t.slug === slug) ?? null;
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
