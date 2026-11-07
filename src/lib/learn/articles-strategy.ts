import { LEARN_ARTICLES_MERGED_STRATEGY } from "@/lib/learn/articles-merged-strategy";
import type { LearnArticle } from "@/lib/learn/types";

/**
 * Tutorials linked from 规则实验室「学习策略」.
 * Lab overview keeps the click path; the template article explains purpose,
 * fit scenarios, and knobs—not a repeated five-step lab walkthrough.
 *
 * 2026-11 consolidation: the six per-template pages (290–400 chars each) were
 * merged into `strategy-lab-six-templates`. Six pages that short could not rank
 * for anything on their own and competed for the same queries.
 */
export const LEARN_ARTICLES_STRATEGY: LearnArticle[] = [
  {
    slug: "strategy-lab-intro",
    category: "tools",
    ctaHref: "/strategies",
    title: {
      "zh-CN": "规则实验室入门：从模板到回放",
      "zh-TW": "規則實驗室入門：從模板到回放",
      en: "Rule Lab intro: from template to replay",
    },
    summary: {
      "zh-CN": "弄清模板库、我的策略与回放怎么串起来；按图示走完第一遍闭环。",
      "zh-TW": "弄清模板庫、我的策略與回放怎麼串起來；按圖示走完第一遍閉環。",
      en: "How templates, My strategies, and replay connect—finish one loop with the mock UI.",
    },
    paragraphs: {
      "zh-CN": [
        "规则实验室不是荐股榜，也不是自动下单系统。它帮你把「什么条件开仓、什么条件离场、仓位怎么定」写成可检查的规则，再在历史日 K 上做简化回放，看看触发密不密、回撤能不能接受。目的是练计划与纪律，不是找收益最高的曲线。",
        "界面三块要先分清：左侧「我的策略」是你复制或新建后的草稿；中间「策略模板库」是内置教学模板；「回测历史」汇总你排过的回放任务。",
        "上方示意图对应真实点击路径。请先通读，再按下列步骤做完一遍；做完后再点某个模板的「学习策略」，读该模板讲的作用、场景与变量。",
        "一、进入实验室：顶部导航打开「规则实验室」，确认页签在「策略模板库」。可先浏览卡片上的标签与适用市场，挑一个难度★较少的模板。",
        "二、复制模板：登录后点卡片「复制」。系统会生成可编辑副本进「我的策略」。不要直接改系统模板。",
        "三、看懂积木与代码：打开副本详情。默认「积木」可改入场、出场、仓位；「代码」是同一套规则 JSON。改完点上方「保存」。",
        "四、跑一条回放：右侧填标的、市场与日期区间，点「排队回放」。完成后看权益曲线、买入持有对照、最大回撤与成交明细。",
        "五、写三句笔记再离开：触发密不密？回撤能不能接受？有没有想中途改规则的冲动？想改就开新版本再回放。",
        "务必记住：回放用简化成交假设；历史表现不代表未来，仅供学习，不构成投资建议。",
      ],
      "zh-TW": [
        "規則實驗室用來寫清開倉／離場／倉位，並做簡化歷史回放，不是薦股或自動下單。",
        "分清「我的策略」「策略模板庫」「回測歷史」。請先看上方示意，再依步驟操作。",
        "一、進入實驗室並選一張簡單模板。",
        "二、登入後「複製」成可編輯副本。",
        "三、在「積木／代碼」改規則並儲存。",
        "四、右側排隊回放，看曲線、回撤與成交。",
        "五、寫三句筆記：觸發密度、回撤能否接受、會否想改規則。",
        "回放≠未來收益；僅供學習，非投資建議。",
      ],
      en: [
        "Rule Lab is for writing checkable entry, exit, and sizing rules, then running a simplified daily-bar replay—not a tip sheet or auto-trader.",
        "Three areas: My strategies, Strategy templates, and Replay history. Study the mock UI, then follow the steps once before opening a per-template article.",
        "1) Open Rule Lab → Strategy templates. Pick a low-difficulty card.",
        "2) Sign in and Copy into My strategies. Templates stay read-only.",
        "3) Edit in Blocks (or Code), then Save.",
        "4) Queue a replay; read equity vs buy&hold, drawdown, and trades.",
        "5) Note trigger density, drawdown tolerance, and the urge to bend the rule.",
        "Educational only—not advice. Replay ≠ future returns.",
      ],
    },
  },
  ...LEARN_ARTICLES_MERGED_STRATEGY,
];
