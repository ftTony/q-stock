import type { AppLocale } from "@/i18n/config";

/**
 * 只在部分语言发布的文章。
 *
 * 判据不是「翻译质量」，而是「制度是否成立」：养老金计发月数、整存整取
 * 靠档计息这类中国大陆法定口径，对海外读者既无法代入也无法验证，留在
 * 英文（及其他语言）下只会变成一篇自说自话的长文，还会把内链指向同样
 * 只在中文下存在的工具页。
 *
 * 与 `src/lib/tools/catalog.ts` 的 `locales` 字段配套：工具在哪几种语言下
 * 上线，讲它的文章就跟着出现在哪几种语言下。
 */
export const ARTICLE_LOCALES: Record<string, readonly AppLocale[]> = {
  "pension-payout-formula": ["zh-CN"],
  "deposit-interest-and-early-withdrawal": ["zh-CN"],
};

/** 该文章是否在给定语言下发布。未列出的文章 = 全语言发布。 */
export function isLearnArticleAvailable(
  slug: string,
  locale: string | undefined,
): boolean {
  const only = ARTICLE_LOCALES[slug];
  if (!only) return true;
  if (!locale) return false;
  return only.includes(locale as AppLocale);
}
