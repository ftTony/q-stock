import type { StrategyRules } from "@/lib/strategy/rules";

export type StrategyTemplateMeta = {
  tagKey:
    | "tagTrend"
    | "tagRisk"
    | "tagDca"
    | "tagExit"
    | "tagDiscipline"
    | "tagSizing";
  markets: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  learnHref: string;
};

export type StrategyTemplateDef = {
  slug: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  rules: StrategyRules;
  meta: StrategyTemplateMeta;
};
