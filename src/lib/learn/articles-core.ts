import { LEARN_ARTICLES_BASICS } from "@/lib/learn/articles-basics";
import { LEARN_ARTICLES_MINDSET } from "@/lib/learn/articles-mindset";
import { LEARN_ARTICLES_TOOLS } from "@/lib/learn/articles-tools";
import type { LearnArticle } from "@/lib/learn/types";

/** First-ship product + craft articles (basics / tools / mindset). */
export const LEARN_ARTICLES_CORE: LearnArticle[] = [
  ...LEARN_ARTICLES_MINDSET,
  ...LEARN_ARTICLES_BASICS,
  ...LEARN_ARTICLES_TOOLS,
];
