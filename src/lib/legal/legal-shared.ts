/**
 * Shared legal doc types + contact constants.
 */
export const LEGAL_CONTACT_EMAIL = "172993974@qq.com";
export const LEGAL_UPDATED = "2026-10-26";

export type LegalBlock =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] };

export type LegalSection = {
  id: string;
  heading: string;
  blocks: LegalBlock[];
};

export type LegalDoc = {
  title: string;
  subtitle: string;
  updatedLabel: string;
  tocLabel: string;
  highlights: string[];
  sections: LegalSection[];
};

export type LegalDocKey = "privacy" | "terms";
