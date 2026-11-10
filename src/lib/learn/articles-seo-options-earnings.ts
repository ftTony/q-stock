import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-10";

/** Classic earnings / event playbook — Futu “财报季期权怎么操作” lane, product-tied. */
export const LEARN_ARTICLES_SEO_OPTIONS_EARNINGS: LearnArticle[] = [
  {
    slug: "options-earnings-season",
    category: "tools",
    ctaHref: "/tools/options",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "Earnings week with options: move, crush, and what not to confuse",
      "zh-CN": "财报周做期权：波动、塌陷，以及别把两件事混成一件",
    },
    summary: {
      en: "Events pack IV into the front of the curve. Being right on direction is not the same as being right on the size of the move after the crush. Here is a checklist that fits the drawer workflow.",
      "zh-CN":
        "事件会把 IV 塞进曲线前端。看对方向，不等于看对 Crush 之后的波动幅度。下面是一套对得起抽屉流程的核对清单。",
    },
    paragraphs: {
      en: [
        "Earnings options feel exciting because the calendar is public. That is also why the move is often already paid for.",
        "Separate three bets: direction, magnitude, and volatility path.",
      ],
      "zh-CN": [
        "财报期权显得刺激，是因为日历公开。也正因为公开，波动常常已经被付过钱了。",
        "把三笔赌注拆开：方向、幅度、波动路径。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "Into the print, IV usually rises. After the number, IV often falls even if the stock gaps. A long call can be directionally correct and still red — that is the crush story covered in the expiry article, now concentrated into one overnight.",
        },
        { type: "h2", text: "Structures people reach for (and why)" },
        {
          type: "table",
          head: ["Intent", "Structure often discussed", "Main risk"],
          rows: [
            [
              "Pay for a big move, side unknown",
              "Long straddle / strangle",
              "Implied move already larger than you need",
            ],
            [
              "Directional with capped debit",
              "Vertical debit spread",
              "Still loses if the gap undershoots the long strike band",
            ],
            [
              "Own shares, want a ceiling sale",
              "Covered call",
              "Assignment into strength; upside capped",
            ],
            [
              "Own shares, want a floor into the event",
              "Protective put / collar",
              "Floor costs premium; collar sells the upside",
            ],
            [
              "Collect elevated front IV",
              "Short premium / iron structures",
              "Gap risk and undefined tails if naked",
            ],
          ],
          caption:
            "None of these are recommendations — they are maps from intent to shape. Size from max loss first.",
        },
        { type: "h2", text: "Drawer checklist the night before" },
        {
          type: "ul",
          items: [
            "Load the expiry that actually contains the event (or the first weekly after).",
            "Compare break-even to the move implied by IV — scenarios help visualize ±1σ / ±2σ.",
            "If you are long vol, ask whether crush alone can erase the thesis.",
            "Write the max-loss sentence into the plan; do not renegotiate it after the gap.",
          ],
        },
        {
          type: "note",
          text: "Liquidity thins in far OTM names into the print. Prefer strikes you can exit; the mid is not a fill.",
        },
        { type: "h2", text: "After the number" },
        {
          type: "p",
          text: "Re-mark the position with the new IV. Long premium that “almost” worked still needs an exit rule. Short premium that collected the crush still needs a gap plan for the next event — one quiet print does not rewrite risk.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "数字公布前，IV 通常抬升；数字落地后，即便跳空，IV 也常回落。看涨买对了方向仍可能翻绿——这就是到期文里的 Crush，只是被压进一个隔夜。",
        },
        { type: "h2", text: "人们常想到的结构（以及为什么）" },
        {
          type: "table",
          head: ["意图", "常被讨论的结构", "主要风险"],
          rows: [
            [
              "付费买大波动，方向不明",
              "买跨式 / 宽跨式",
              "隐含波动已经大于你需要的幅度",
            ],
            [
              "有方向，借记要封顶",
              "借记垂直价差",
              "跳空仍够不着长腿那一段",
            ],
            [
              "持股，想卖掉天花板",
              "备兑看涨",
              "大涨被指派；上行被盖住",
            ],
            [
              "持股，事件前要地板",
              "保护性看跌 / 领口",
              "地板要付权利金；领口卖掉上行",
            ],
            [
              "收近月抬高的 IV",
              "卖权利金 / 铁鹰一类",
              "跳空风险；裸卖时尾部不封顶",
            ],
          ],
          caption: "都不是推荐——只是意图到形状的地图。先按最大亏损定仓。",
        },
        { type: "h2", text: "前一晚的抽屉核对" },
        {
          type: "ul",
          items: [
            "加载真正覆盖事件的到期（或其后第一个周期权）。",
            "把平衡点跟 IV 隐含波动比一下——情景表有助于看 ±1σ / ±2σ。",
            "若你是波动多头，问一句：光 Crush 会不会抹掉论点。",
            "把最大亏损那句话写进计划；跳空后不要现场改价码。",
          ],
        },
        {
          type: "note",
          text: "临近公布，远处价外流动性会变薄。优先能退出的行权价；中间价不是成交价。",
        },
        { type: "h2", text: "数字出来之后" },
        {
          type: "p",
          text: "用新的 IV 重新标记仓位。「差一点就对」的长期权仍要有离场规则。靠 Crush 收到钱的卖方，下一场事件仍要有跳空预案——一次安静的财报改写不了风险。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Should I always avoid holding long options through earnings?",
          a: "Not always — but you must price the crush. If the thesis is only direction, a vertical may waste less vega.",
        },
      ],
      "zh-CN": [
        {
          q: "是不是永远不该持有期权过财报？",
          a: "不是永远——但必须给 Crush 定价。若论点只是方向，垂直价差往往少浪费一些 Vega。",
        },
      ],
    },
    links: {
      en: [
        { label: "Expiry and IV crush", href: "/learn/options-expiry-iv-crush" },
        {
          label: "Volatility strategies",
          href: "/learn/options-strategies-volatility",
        },
        { label: "Break-even and scenarios", href: "/learn/options-breakeven-scenarios" },
      ],
      "zh-CN": [
        { label: "到期与 IV Crush", href: "/learn/options-expiry-iv-crush" },
        {
          label: "跨式 · 宽跨式 · 蝶式",
          href: "/learn/options-strategies-volatility",
        },
        { label: "盈亏平衡与到期情景", href: "/learn/options-breakeven-scenarios" },
      ],
    },
    sourceNote: {
      en: "Educational. Event trades are path-dependent; nothing here is a tip.",
      "zh-CN": "仅供学习。事件单依赖路径；本文不构成任何提示。",
    },
  },
];
