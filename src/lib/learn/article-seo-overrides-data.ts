import type { SeoPatch } from "@/lib/learn/article-seo-overrides-a";
import { LEARN_SEO_OVERRIDES_A } from "@/lib/learn/article-seo-overrides-a";
import { LEARN_SEO_OVERRIDES_B } from "@/lib/learn/article-seo-overrides-b";

export type { SeoPatch } from "@/lib/learn/article-seo-overrides-a";

export const LEARN_SEO_OVERRIDES: Record<string, SeoPatch> = {
  ...LEARN_SEO_OVERRIDES_A,
  ...LEARN_SEO_OVERRIDES_B,
};
