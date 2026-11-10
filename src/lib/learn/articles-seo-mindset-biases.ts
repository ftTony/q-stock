import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-10";
const UPDATED = "2026-11-10";

/**
 * Deep rewrite: behavioral biases as mid-trade plan editors.
 * Concrete desk scenes + product gates — not a textbook glossary.
 */
export const LEARN_ARTICLES_SEO_MINDSET_BIASES: LearnArticle[] = [
  {
    slug: "mindset-behavior-biases",
    category: "mindset",
    ctaHref: "/learn/checklist-three",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: UPDATED,
    title: {
      en: "Five biases that rewrite your plan after you are already in",
      "zh-CN": "五种行为偏差：成交之后，是谁在改你的计划",
    },
    summary: {
      en: "Most damage is not the entry. It is the quiet rewrite—averaging, early profit-taking, moving stops—while the story still sounds like analysis. Name the editor, then nail a gate to the workbench.",
      "zh-CN":
        "多数伤害不在进场那一下，而在进场之后的悄然改写：摊平、早兑现、挪止损——故事听起来仍像分析。先给「改剧本的人」起名，再把门闩钉进工作台。",
    },
    paragraphs: {
      en: [
        "If you only remember one line: biases rarely stop you from clicking. They edit the contract you made with yourself once the P&L turns color.",
        "That is why vocabulary without gates is theater.",
      ],
      "zh-CN": [
        "先记一句：偏差很少拦得住你点下去。它们改的是盈亏变色之后，你跟自己签过的那份合同。",
        "所以只有名词、没有门闩，等于演戏。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "Behavioral finance lists dozens of biases. On a retail desk you mostly meet five editors. Each one arrives with a sentence that feels responsible. Your job is not to feel ashamed—it is to catch the sentence before it becomes size.",
        },
        { type: "h2", text: "Loss aversion: the planned loss that becomes unplanned size" },
        {
          type: "p",
          text: "A −1R stop was written. Price tags it. Instead of exiting, you hear “too shallow, washout.” You add. Now the same thesis carries twice the risk with half the clarity. Loss aversion is not fear of red—it is the refusal to close a story that would make the entry look wrong.",
        },
        {
          type: "p",
          text: "Gate in Q-Stock: put the invalidation on an alert before entry. When it fires, the rule is pause and execute the plan—not open a chat with yourself. The three-question checklist’s risk % is a hard ceiling; averaging that blows through it is a new trade, not “managing.”",
        },
        { type: "h2", text: "Disposition effect: green dopamine versus red hope" },
        {
          type: "p",
          text: "Winners get sold for the relief of locking green. Losers stay open for the hope of flat. The account then looks “disciplined” on wins and “patient” on losses—two flattering words for the same asymmetry. Classic disposition research is not an insult; it is a description of how people manage feelings, not expectancy.",
        },
        {
          type: "p",
          text: "Gate: write exit doors before entry (invalidation / time / R-multiple). A +1R scale can be planned; an impulsive “take it while green” that abandons a still-valid structure is disposition wearing a suit. See the stocks exit-rules lesson for the three-door frame.",
        },
        { type: "h2", text: "Anchoring: cost basis as fake fair value" },
        {
          type: "p",
          text: "You paid 48. The tape is 41. “Fair” becomes 48 because that number is yours. Round numbers work the same way—100, 200—except the crowd shares the anchor. Neither number is structure. Structure is where participation previously flipped, drawn as a band you can defend in one sentence.",
        },
        {
          type: "p",
          text: "Gate: on the symbol chart, mark bands from swings or range edges. Put alerts on the invalidation side of the band. Cost belongs in the fill ticket and the review note—not as a target or a dignity line.",
        },
        { type: "h2", text: "Confirmation: the feed that agrees with your position" },
        {
          type: "p",
          text: "After you are long, bullish headlines feel like research. AI answers that rhyme with your side feel like “cross-check.” Disconfirming filings feel like noise. Confirmation bias does not invent facts; it ranks them.",
        },
        {
          type: "p",
          text: "Gate: before size, force two lines into the plan note—peer compare (who is cheaper/dearer on the same ruler) and one opposite case (“this fails if…”). If AI chart-read and your eye disagree, stop; do not argue the model into submission.",
        },
        { type: "h2", text: "Herd / FOMO: volume as social proof" },
        {
          type: "p",
          text: "A friend is up. The tape is loud. Your watchlist grew by five tickers you cannot explain. FOMO is desire wearing a market costume—compare-desire from the greed/fear essay, now with a broker ticket. The cost is not only a bad fill; it is attention debt that makes the next checklist fail.",
        },
        {
          type: "p",
          text: "Gate: keep the watchlist short (alerts lesson). Before any add, calm-watching three lines on one daily chart only—structure, level, invalidation. If you cannot write them without opening the social feed, you are not analyzing; you are catching heat.",
        },
        {
          type: "table",
          head: ["Editor", "Sentence you will hear", "Workbench latch"],
          rows: [
            ["Loss aversion", "“Washout—add a bit.”", "Invalidation alert; risk % ceiling"],
            ["Disposition", "“Lock green / wait for flat.”", "Exit doors pre-written"],
            ["Anchoring", "“Fair is my cost / the round number.”", "Structure bands, not cost"],
            ["Confirmation", "“See, even the news agrees.”", "Peers + opposite case in plan"],
            ["FOMO", "“Everyone is in—don’t miss it.”", "Short list + three calm lines"],
          ],
          caption:
            "If you cannot name which editor spoke, do not increase size. Naming is the first gate.",
        },
        { type: "h2", text: "Weekly review that actually changes next week" },
        {
          type: "p",
          text: "Pick three closed paper or live trades. For each: did any editor rewrite the plan after entry? Change one latch only—alert price, risk %, or checklist wording. Changing five indicators is usually confirmation bias about your “system.” Bias work is boring on purpose; boredom is a feature.",
        },
        {
          type: "note",
          text: "Pair this with Thinking, Fast and Slow: System 1 writes the sentence; the checklist is System 2 on shift. Experience does not delete biases—it often makes the stories more eloquent.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "行为金融能列出几十种偏差。零售交易台上，你真正反复遇见的，往往是五个「改剧本的人」。每个到来时都带着一句听起来很负责的话。你的工作不是羞愧，而是在这句话变成仓位之前抓住它。",
        },
        { type: "h2", text: "损失厌恶：计划内小亏，如何变成计划外重仓" },
        {
          type: "p",
          text: "失效写在 −1R。价格碰到了。你没有走，你听见「洗得不够深」。你加仓。同一论点现在扛着两倍风险，清晰度却剩一半。损失厌恶不是怕红色——是拒绝结束一个会让进场看起来「错了」的故事。",
        },
        {
          type: "p",
          text: "钱力股里的门闩：进场前把失效价做成提醒。铃响的规则是停手、执行计划——不是开启一场自我谈判。三问清单里的风险%是硬顶；加仓突破它，是新开一笔，不是「管理仓位」。",
        },
        { type: "h2", text: "处置效应：绿色多巴胺对红色希望" },
        {
          type: "p",
          text: "赢家早早卖掉，为了锁住绿色的轻松；输家一直留着，为了「回到成本就好」。账户于是在赢的一边显得「纪律」，在亏的一边显得「耐心」——两个好听的词，盖着同一种不对称。经典处置效应研究不是骂人，是在描述人如何管理感受，而不是管理期望值。",
        },
        {
          type: "p",
          text: "门闩：进场前写好离场三扇门（失效 / 时间 / R 倍数）。+1R 分批可以是计划；结构仍在却冲动「先落袋为安」，是穿西装的处置效应。细节见股票课「何时卖出」。",
        },
        { type: "h2", text: "锚定：成本价冒充公道价" },
        {
          type: "p",
          text: "你买在 48，现在 41。「公道」变成 48，只因为那是你的数字。整数关口同理——100、200——只不过锚被更多人共享。两者都不是结构。结构是参与者曾经翻过脸的地方，画成你能一句话辩护的带子。",
        },
        {
          type: "p",
          text: "门闩：个股图上按摆动或箱体沿标带子；提醒设在失效一侧。成本属于成交记录与复盘备注——不是目标价，也不是尊严线。",
        },
        { type: "h2", text: "确认偏误：只给持仓投票的信息流" },
        {
          type: "p",
          text: "做多之后，偏多新闻像研究；跟你同向的 AI 回答像「交叉验证」；打脸的披露像噪音。确认偏误不发明事实，它给事实排序。",
        },
        {
          type: "p",
          text: "门闩：上仓前，计划备注里强制两行——同业对比（同一把尺子谁贵谁便宜），以及一条反方（「若……则论点作废」）。AI 读图与肉眼打架时停手，别把模型辩到服气。",
        },
        { type: "h2", text: "从众 / 怕踏空：把成交量当社会证明" },
        {
          type: "p",
          text: "朋友在赚。盘面很吵。自选多了五只你讲不清的票。FOMO 是欲望穿上行情外套——《贪婪恐惧与欲望》里的比较欲，现在带着委托。代价不只是更差的成交价，还有注意力债：下一笔三问更容易失败。",
        },
        {
          type: "p",
          text: "门闩：自选做短（见提醒课）。任何加仓前，只对一张日线写冷静看盘三句——结构、价位、失效。若不打开社交信息流就写不出来，你就不是在分析，是在蹭热。",
        },
        {
          type: "table",
          head: ["改剧本的人", "你会听见的句子", "工作台门闩"],
          rows: [
            ["损失厌恶", "「洗盘，再补一点。」", "失效提醒；风险%封顶"],
            ["处置效应", "「先锁绿 / 等到回本。」", "离场门事先写好"],
            ["锚定", "「公道价是我的成本 / 那个整数。」", "结构带子，不是成本"],
            ["确认偏误", "「你看，连新闻都同意。」", "同业 + 反方写进计划"],
            ["FOMO", "「大家都在，别踏空。」", "短名单 + 冷静三句"],
          ],
          caption: "叫不出是谁在说话，就不要加仓。起名本身就是第一扇门。",
        },
        { type: "h2", text: "能改下周行为的周复盘" },
        {
          type: "p",
          text: "挑三笔已了结的模拟或实盘。逐笔问：进场后有没有编辑进来改计划？只改一扇门闩——提醒价、风险%，或清单措辞。一次换五个指标，多半是关于「我的体系」的确认偏误。偏差功课故意无聊；无聊是功能，不是缺陷。",
        },
        {
          type: "note",
          text: "旁边放《思考，快与慢》：系统 1 写句子，清单是系统 2 值班。经验删不掉偏差——它常常只是把故事讲得更圆。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "I already know these names. Why reread?",
          a: "Knowing the label and catching the sentence under P&L pressure are different skills. The second needs gates rehearsed on paper.",
        },
        {
          q: "Can one checklist kill all five?",
          a: "No. The checklist is the shared doorframe. Each bias still needs its own latch—alert, peers note, exit doors.",
        },
      ],
      "zh-CN": [
        {
          q: "名词我都懂，为什么还要读？",
          a: "认得标签，和在盈亏压力下抓住那句话，是两种能力。后者要靠模拟把门闩练熟。",
        },
        {
          q: "一张三问清单能灭掉全部五种吗？",
          a: "不能。清单是共用门框。每种偏差仍要自己的门闩——提醒、同业备注、离场门。",
        },
      ],
    },
    links: {
      en: [
        { label: "Three questions", href: "/learn/checklist-three" },
        { label: "Calm watching", href: "/learn/calm-watching" },
        { label: "Crash first-aid", href: "/learn/mindset-crash-first-aid" },
        {
          label: "Thinking, Fast and Slow",
          href: "/learn/book-thinking-fast-slow",
        },
      ],
      "zh-CN": [
        { label: "下单前三问", href: "/learn/checklist-three" },
        { label: "冷静看盘", href: "/learn/calm-watching" },
        { label: "暴跌急救", href: "/learn/mindset-crash-first-aid" },
        {
          label: "《思考，快与慢》",
          href: "/learn/book-thinking-fast-slow",
        },
      ],
    },
    sourceNote: {
      en: "Educational. Bias labels describe tendencies under uncertainty—not clinical diagnoses.",
      "zh-CN":
        "仅供学习。偏差标签描述不确定下的倾向，不是临床诊断。",
    },
  },
];
