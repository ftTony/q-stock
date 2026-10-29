import { getRequestConfig } from "next-intl/server";
import type { AbstractIntlMessages } from "next-intl";
import { defaultLocale, locales, type AppLocale } from "./config";

/**
 * 语言包回退链：当前语言 → en → zh-CN。
 *
 * 背景：zh-CN 有 1898 个键，en 缺 47 个，其余 8 种语言各缺 61 个
 * （主要是 `symbol.*` 的估值字段标签：peStatic / pbRatio / sharesOut /
 * fundsNetIn / fundsNetOut / derivativesConnLimit …）。缺键时 next-intl
 * 会把 key 名直接抛到界面上，英文版个股页就会出现 "symbol.pbRatio" 这种空标签。
 *
 * 与其等翻译补齐，不如先保证「永远有字」：缺失处逐级回退。
 * 真正的缺口由 `scripts/check-i18n-keys.ts` 在 CI 里盯住，不再继续扩散。
 */
type Bundle = AbstractIntlMessages;

function isPlainObject(v: unknown): v is Bundle {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** 深合并：`over` 里缺的键用 `base` 补；`over` 有的键以 `over` 为准。 */
function deepMerge(base: Bundle, over: Bundle): Bundle {
  const out: Bundle = { ...base };
  for (const [key, value] of Object.entries(over)) {
    const prev = out[key];
    out[key] =
      isPlainObject(prev) && isPlainObject(value)
        ? deepMerge(prev, value)
        : value;
  }
  return out;
}

/** 合并结果按语言缓存，避免每个请求重复遍历近 2000 个键。 */
const cache = new Map<string, Bundle>();

async function messagesFor(locale: AppLocale): Promise<Bundle> {
  const hit = cache.get(locale);
  if (hit) return hit;

  const [zh, en, current] = await Promise.all([
    // JSON 里的数组字面量（如 `seo.keywords`）不满足 AbstractIntlMessages 的值类型，
    // 这里统一按 next-intl 的字典类型断言；next-intl 本身对数组值是支持的。
    import("../../messages/zh-CN.json").then((m) => m.default as unknown as Bundle),
    import("../../messages/en.json").then((m) => m.default as unknown as Bundle),
    locale === "en"
      ? Promise.resolve(null)
      : import(`../../messages/${locale}.json`).then(
          (m) => m.default as unknown as Bundle,
        ),
  ]);

  const result = current
    ? deepMerge(deepMerge(zh, en), current)
    : deepMerge(zh, en);
  cache.set(locale, result);
  return result;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !locales.includes(locale as AppLocale)) {
    locale = defaultLocale;
  }
  return {
    locale,
    messages: await messagesFor(locale as AppLocale),
  };
});
