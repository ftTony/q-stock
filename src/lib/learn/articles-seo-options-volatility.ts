import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-10";

/** Straddle / strangle / butterfly, with one worked numeric band. */
export const LEARN_ARTICLES_SEO_OPTIONS_VOLATILITY: LearnArticle[] = [
  {
    slug: "options-strategies-volatility",
    category: "tools",
    ctaHref: "/tools/options",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "When the bet is the size of the move: straddle, strangle, butterfly",
      "zh-CN": "赌的是波动大不大：跨式、宽跨式、蝶式",
    },
    summary: {
      en: "These three drawer templates care less about up-versus-down and more about how far price travels — or how tightly it pins. Three hypothetical bands worked out in numbers, plus the ways each shape usually breaks.",
      "zh-CN":
        "抽屉里这三种模板，不太关心涨还是跌，更关心走出多远——或者钉在多窄的区间。三组假设数字算清盈亏带，再讲每种形状常见怎么坏。",
    },
    paragraphs: {
      en: [
        "A straddle needs the underlying to leave town. A butterfly needs it to stay home. Direction is optional; magnitude is not.",
        "IV is the quiet partner: overpay for volatility and even a big move may only get you back to even. All numbers below are hypothetical.",
      ],
      "zh-CN": [
        "跨式要标的离家出走，蝶式要它待在家里。方向可以不选，幅度不能不选。",
        "IV 是那个安静的合伙人：波动买贵了，走再远可能也只是刚回本。以下数字全部为假设。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "In the drawer, the Straddle / Strangle / Butterfly chips build all legs from the live chain. Long is the default educational side; short structures invert the payoff and deserve a written max-loss answer before any size.",
        },
        { type: "h2", text: "Straddle, worked in numbers" },
        {
          type: "p",
          text: "Same strike, same expiry: long call + long put, usually at-the-money. You pay two premiums for two wings. Example: stock at 150, two weeks out, IV 35% — the 150 call prices near 4.2, the 150 put near 4.0, total 8.2 per share, or 820 dollars a contract.",
        },
        {
          type: "table",
          head: ["Item", "Long 150 straddle"],
          rows: [
            ["Total debit", "8.20 (≈ $820 / contract)"],
            ["Upper break-even", "158.2 — needs +5.5%"],
            ["Lower break-even", "141.8 — needs −5.5%"],
            ["Max loss", "820, if expiry pins exactly 150"],
            ["Max profit", "Uncapped on either wing"],
          ],
          caption:
            "Hypothetical, BS approximation, fees ignored. The ±5.5% band is the real price tag — compare it to your own expectation, not to hope.",
        },
        {
          type: "p",
          text: "The honest question before buying one: can I picture this stock moving six percent? If your answer is \u201cit's earnings, it will move\u201d, that is not a magnitude estimate. Straddles bought on vibes are the classic way to be right about an event and still lose.",
        },
        {
          type: "ul",
          items: [
            "The short straddle is the mirror: it collects both premiums and owns the gap. With no wings it is theoretically uncapped on both sides — this is why most sellers run iron condors instead, buying cheap OTM wings to cap the tail.",
            "After the event, theta and IV crush work together against the long straddle; there is no passive way to wait it out.",
            "If you want the position to survive a quieter-than-expected print, the decision belongs before the print, not after.",
          ],
        },
        { type: "h2", text: "Strangle: cheaper ticket, wider dead zone" },
        {
          type: "p",
          text: "OTM put + OTM call, same expiry. Example on the same 150 stock: the 140 put near 1.40 and the 160 call near 1.50, total 2.9 — about 65% cheaper than the straddle. The trade-off is exactly the width: break-evens at 137.1 and 162.9, roughly ±8.6%.",
        },
        {
          type: "table",
          head: ["Item", "Long strangle", "Long straddle (for contrast)"],
          rows: [
            ["Net debit", "2.90", "8.20"],
            ["Break-even band", "±8.6% (137.1 / 162.9)", "±5.5% (141.8 / 158.2)"],
            ["Max loss", "$290", "$820"],
            ["Cost of being early", "Small loss while chop continues", "Larger daily bleed"],
          ],
          caption:
            "Hypothetical numbers. Cheaper does not mean easier — the move has to travel further before you are paid.",
        },
        {
          type: "p",
          text: "Skip it when the implied move already covers your break-evens and you expect less. Buying a strangle whose ±8.6% you do not actually believe in is paying real money for a tail you consider unlikely — the screen being cheap is not a reason by itself.",
        },
        { type: "h2", text: "Butterfly: paid for calm, inside a band" },
        {
          type: "p",
          text: "Long 1 × 140 call, short 2 × 150 calls, long 1 × 160 call — equal spacing, same expiry, net debit near 3.6. If expiry pins the middle strike, profit is (10 − 3.6) × 100 = 640. Walk away from 150 in either direction and P&L slides toward the −360 cap. It is a paid expression of \u201cnot much happens\u201d.",
        },
        {
          type: "table",
          head: ["Item", "Long 140/150/160 call fly"],
          rows: [
            ["Net debit", "≈ 3.60 ($360)"],
            ["Max profit", "640, exactly at 150 at expiry"],
            ["Max loss", "360, beyond either wing"],
            ["Profile", "Small band of big profit, wide plateaus of defined loss"],
          ],
          caption:
            "Hypothetical. The fly's profit peak is a single point at expiry — pin risk is real, and so is the temptation to hold for a miracle.",
        },
        {
          type: "p",
          text: "People reach for flies when IV is still sticky after an event, or when price keeps gravitating to a round level. The structure dies quietly when a trend rips through a wing — and because the loss is capped, it dies without drama. That is a feature, as long as the 360 was affordable on day one.",
        },
        { type: "h2", text: "Common ways this goes wrong" },
        {
          type: "ul",
          items: [
            "Buying a straddle as \u201cinsurance\u201d before an event, then letting it sit: crush plus theta cut both premiums while you wait for the move that already happened.",
            "Reading \u201closs is capped\u201d as \u201csafe\u201d: the cap on a fly is 360 real dollars, and the win rate is not high enough to ignore it.",
            "Ignoring wing liquidity on the three-legged fly until mid-session, then discovering the spreads make adjusting pointless.",
          ],
        },
        {
          type: "p",
          text: "One habit fixes most of it: before entry, write down the break-even band and your own expected move on the same line. If the second number is smaller than the first, the trade is a donation with extra steps.",
        },
        { type: "h2", text: "Where to check these in Q-Stock" },
        {
          type: "p",
          text: "The drawer builds all three from the live chain; click any leg to swap strikes and everything re-prices. Watch the ±σ scenario rows: for long vol they should fan open as prices leave spot — a column of identical premium losses means the structure is still OTM everywhere in that band, or there is too little time left. To price each leg separately, or to ask what IV does to the band, use /tools/options and edit inputs directly. Set the event into /alerts so the straddle does not quietly outlive its thesis, and record the band in /review.",
        },
        {
          type: "note",
          text: "Educational, not advice. Long structures lose the full debit at worst; short structures carry gap and pin risk that a capped debit never shows. Calendars and diagonals live in the next article.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "抽屉里的跨式 / 宽跨式 / 蝶式芯片直接从实时链上搭腿。默认从买方讲起；卖方结构盈亏相反，任何仓位之前先写一句最大亏损的答案。",
        },
        { type: "h2", text: "跨式，带数字算一遍" },
        {
          type: "p",
          text: "同行权价、同到期：买 Call + 买 Put，多半平值。两份权利金换两片翅膀。算例：股价 150，两周后到期，IV 35%——150 Call 约 4.2，150 Put 约 4.0，合计 8.2 每股，一张合约 820 美元。",
        },
        {
          type: "table",
          head: ["项目", "买入 150 跨式"],
          rows: [
            ["净支出", "8.20（约 820 美元 / 张）"],
            ["上方平衡", "158.2，需要 +5.5%"],
            ["下方平衡", "141.8，需要 −5.5%"],
            ["最大亏损", "820，到期恰好钉在 150 时"],
            ["最大盈利", "两侧翅膀不封顶"],
          ],
          caption:
            "假设数字，BS 近似，不含费用。±5.5% 这条带才是真正的价签——拿它和你的预期比，别拿它和愿望比。",
        },
        {
          type: "p",
          text: "买之前诚实问一句：我能想象这只票走 6% 吗？如果答案是「反正有财报，会动的」——那不是幅度估计。靠感觉买的跨式，是「事件对了钱还亏了」的经典来源。",
        },
        {
          type: "ul",
          items: [
            "卖跨式是镜像：收两份权利金，承担两头跳空。没有翅膀时两侧理论上都不封顶——所以多数卖方改做铁鹰，买便宜虚值翅膀把尾部钉住。",
            "事件过后，Theta 和 IV Crush 一起对付买跨式，没有「 passive 等它回来」这回事。",
            "若想扛一次比预期安静的财报，这个决定要在财报前做，不是之后。",
          ],
        },
        { type: "h2", text: "宽跨式：票更便宜，死亡区间更宽" },
        {
          type: "p",
          text: "虚值 Put + 虚值 Call，同到期。同一只 150 的股票：140 Put 约 1.40，160 Call 约 1.50，合计 2.9——比跨式便宜约 65%。代价恰好是宽度：平衡点 137.1 和 162.9，约 ±8.6%。",
        },
        {
          type: "table",
          head: ["项目", "买入宽跨式", "对照：买入跨式"],
          rows: [
            ["净支出", "2.90", "8.20"],
            ["平衡带", "±8.6%（137.1 / 162.9）", "±5.5%（141.8 / 158.2）"],
            ["最大亏损", "290 美元", "820 美元"],
            ["提前上车的成本", "横盘时小额损耗", "每天更疼"],
          ],
          caption:
            "假设数字。便宜不等于容易——标的要走更远才开始付钱。",
        },
        {
          type: "p",
          text: "什么时候不用它：隐含波动已经覆盖了你的平衡点，而你预期比它小。买一个自己都不信 ±8.6% 的宽跨式，是花真钱买一条你认为不太可能的尾巴——屏幕便宜本身不是理由。",
        },
        { type: "h2", text: "蝶式：为「安静」付费，限定在一条带里" },
        {
          type: "p",
          text: "买 1 张 140 Call、卖 2 张 150 Call、买 1 张 160 Call——等距、同到期，净支出约 3.6。到期钉在中间行权价，利润 (10 − 3.6) × 100 = 640；离开 150 往任何一边走，盈亏滑向 −360 的上限。这是一份为「没多大动静」付费的表达。",
        },
        {
          type: "table",
          head: ["项目", "买入 140/150/160 Call 蝶"],
          rows: [
            ["净支出", "≈ 3.60（360 美元）"],
            ["最大盈利", "640，到期恰好 150 时"],
            ["最大亏损", "360，任一翅膀之外"],
            ["轮廓", "窄带内的大利润，宽平台上的有顶亏损"],
          ],
          caption:
            "假设数字。蝶式的利润峰是到期时的一个点——钉住风险是真的，想再等等奇迹的冲动也是真的。",
        },
        {
          type: "p",
          text: "事件过后 IV 还偏粘、或价格反复围绕某个整数位晃时，有人会想到蝶式。趋势一头撞穿翅膀时它悄悄死掉——亏损有顶，所以死得不喧哗。前提只有一个：那 360 美元在第一天就是亏得起的。",
        },
        { type: "h2", text: "常见踩坑" },
        {
          type: "ul",
          items: [
            "财报前把跨式当「保险」买，然后放着不动：Crush 加 Theta 双面夹击，等你反应过来，动的那一下早就过去了。",
            "把「亏损有上限」读成「安全」：蝶式的上限是实打实的 360 美元，胜率也不高到可以无视它。",
            "三条腿的流动性留到盘中才看，才发现两翼价差宽到调整毫无意义。",
          ],
        },
        {
          type: "p",
          text: "一个习惯能挡掉大半：进场前把平衡带和自己预期的幅度写在同一行。第二个数比第一个小，这笔交易就是一笔绕了弯路的捐款。",
        },
        { type: "h2", text: "在钱力股里核对" },
        {
          type: "p",
          text: "抽屉从实时链上搭三种结构，点腿换行权价即时重算。盯 ±σ 情景行：买波动时盈亏应随离开现价张开——整列都是同一笔权利金亏损，说明结构在这条带里全虚值，或剩余天数太少。想单独给每条腿定价、看 IV 对平衡带的影响，去 /tools/options 直接改参数。事件日期挂进 /alerts，别让跨式悄悄活得比论点久；平衡带写进 /review。",
        },
        {
          type: "note",
          text: "仅供学习，不构成建议。买方最坏亏光净支出；卖方要面对跳空与钉住风险，那是借记结构看不到的。日历与对角见下一篇。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Straddle or strangle before earnings?",
          a: "Compare the bands, not the excitement: the straddle needed ±5.5% in the example, the strangle ±8.6%. Whatever you actually expect should clear the band with room to spare, or the crush eats the difference.",
        },
        {
          q: "Is a butterfly safe because the loss is capped?",
          a: "Capped at the debit — 360 dollars in the example is a real loss. The cap controls the tail, not the win rate, and the profit peak is a single expiry point.",
        },
        {
          q: "Can I hold a straddle through the event and sell right after?",
          a: "You can, but expect the double premium to shrink immediately if IV collapses — direction being right is not enough. Plan the exit and the definition of \u201cmove delivered\u201d before the print.",
        },
        {
          q: "Why is my straddle red when the stock finally moved?",
          a: "Usually the move stayed inside the break-even band while IV fell. Re-mark with post-event IV: if the move was smaller than the band, the loss is structural, not bad luck.",
        },
      ],
      "zh-CN": [
        {
          q: "财报前选跨式还是宽跨式？",
          a: "比平衡带，不比兴奋感：例子里跨式要 ±5.5%，宽跨式要 ±8.6%。你真实预期的幅度得明显高于那条带，否则 Crush 会吃掉差额。",
        },
        {
          q: "蝶式亏损有上限，是不是更安全？",
          a: "上限是净支出——例子里 360 美元是实打实的亏损。顶只是管住尾巴，不管胜率，利润峰也只是到期时的一个点。",
        },
        {
          q: "跨式能不能拿着过财报，出完数字就卖？",
          a: "可以，但 IV 塌下来双份权利金会立刻缩水——方向对了不够。财报前就把离场规则和「波动算不算兑现」的定义写好。",
        },
        {
          q: "股票终于动了，跨式为什么还是红的？",
          a: "多半是波动停在了平衡带里面，同时 IV 还跌了。用事件后的 IV 重新估值：若幅度没出带，这个亏损是结构性的，不是运气差。",
        },
      ],
    },
    links: {
      en: [
        { label: "Directional templates", href: "/learn/options-strategies-directional" },
        { label: "Expiry and IV crush", href: "/learn/options-expiry-iv-crush" },
        { label: "Calendar and diagonal", href: "/learn/options-strategies-calendar" },
        { label: "IV, HV and rank", href: "/learn/options-iv-hv-rank" },
        { label: "Options calculator", href: "/tools/options" },
        { label: "Watchlist and alerts", href: "/watchlist" },
      ],
      "zh-CN": [
        { label: "单腿 · 担保 · 垂直 · 领口", href: "/learn/options-strategies-directional" },
        { label: "到期与 IV Crush", href: "/learn/options-expiry-iv-crush" },
        { label: "日历与对角", href: "/learn/options-strategies-calendar" },
        { label: "IV、HV 与百分位", href: "/learn/options-iv-hv-rank" },
        { label: "期权计算器", href: "/tools/options" },
        { label: "自选与提醒", href: "/watchlist" },
      ],
    },
    sourceNote: {
      en: "Educational. All premiums in the examples are hypothetical BS approximations; confirm live quotes and liquidity on every leg. Not advice.",
      "zh-CN":
        "仅供学习。例中权利金均为假设的 BS 近似值；每条腿的实时报价与流动性请自行确认。不构成建议。",
    },
  },
];
