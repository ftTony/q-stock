/**
 * 法务文档正文（隐私政策 / 服务条款）。
 * 正文拆到 privacy-* 与 terms-*；本文件只做聚合与语言解析。
 */
export {
  LEGAL_CONTACT_EMAIL,
  LEGAL_UPDATED,
  type LegalBlock,
  type LegalDoc,
  type LegalDocKey,
  type LegalSection,
} from "./legal-shared";

import type { LegalDoc, LegalDocKey } from "./legal-shared";
import { zhPrivacy } from "./privacy-zh";
import { enPrivacy } from "./privacy-en";
import { zhTerms } from "./terms-zh";
import { enTerms } from "./terms-en";

const DOCS: Record<LegalDocKey, Record<"en" | "zh-CN", LegalDoc>> = {
  privacy: { en: enPrivacy, "zh-CN": zhPrivacy },
  terms: { en: enTerms, "zh-CN": zhTerms },
};

const ZH_VARIANTS = new Set(["zh-CN", "zh-TW", "zh-HK"]);

export function resolveLegalDoc(
  key: LegalDocKey,
  locale: string,
): { doc: LegalDoc; fallback: boolean } {
  if (ZH_VARIANTS.has(locale)) {
    return { doc: DOCS[key]["zh-CN"], fallback: locale !== "zh-CN" };
  }
  if (locale === "en") return { doc: DOCS[key].en, fallback: false };
  return { doc: DOCS[key].en, fallback: true };
}
