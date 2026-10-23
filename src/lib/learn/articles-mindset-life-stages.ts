import type { LearnArticle } from "@/lib/learn/types";

/**
 * Life-stage money planning, using Investments-textbook temper
 * (risk budget, horizon, diversification, human capital)—not a Bodie crib sheet.
 */
export const LEARN_ARTICLE_LIFE_STAGE_PLAN: LearnArticle = {
  slug: "life-stage-money-plan",
  category: "mindset",
  ctaHref: "/learn/financial-freedom-defined",
  title: {
    "zh-CN": "按人生阶段做钱的规划：风险、期限与组合",
    "zh-TW": "按人生階段做錢的規劃：風險、期限與組合",
    en: "Money by life stage: risk, horizon, and the portfolio of a life",
  },
  summary: {
    "zh-CN": "借《投资学》的脾气——先风险与期限，再收益——把青年、立业、中年、临退拆成可改的规划，而不是一套到老的仓位口号。",
    "zh-TW": "借《投資學》的脾氣——先風險與期限，再收益——把青年、立業、中年、臨退拆成可改的規劃。",
    en: "Borrow the temper of Investments: risk and horizon before return. Plan youth, building years, midlife, and near-retirement as editable layers—not one slogan forever.",
  },
  paragraphs: {
    "zh-CN": [
      "很多人问《投资学》讲了什么、对人一生有什么启发、该怎么规划人生——其实是在问同一件事：钱在不同年龄该承担什么角色。博迪等人的教材（Bodie / Kane / Marcus《Investments》）不会替你写人生脚本；它给的是一套冷语言：收益是对风险的补偿；分散能压特质风险；期限决定你扛得住怎样的波动；人力资本（未来工资）往往是年轻时最大的「资产」。把这套脾气迁到生活里，规划就不该是「永远满仓成长股」或「永远只存银行」，而是按阶段改组合。",
      "先立边界。下文按大致年龄段写「常见约束与默认动作」，不是人生考卷标准答案。结婚早晚、有无子女、是否创业、身处哪座城市、健康与赡养义务，都会改写表格。数字比例只是草稿，用来启动思考；真正该钉死的是：足够线、应急月数、单笔亏得起、什么手段绝不碰。定义自由见《财富自由到底是什么》；激励与带宽见《经济学怎么帮散户想清楚》。本站内容仅供学习参考，不构成投资建议。",
      "贯穿各阶段的四条硬规矩（比背资产配置表管用）",
      "一、先期限，后产品。钱若三年内大概率要用（首付尾款、学费、经营周转），默认不进高波动仓位——不是胆小，是避免「被迫在最差时刻卖出」。二、先风险预算，后收益幻想。问「最坏回撤后生活是否仍转得动」，再谈指数、个股或主题。三、人生是组合：工作、现金缓冲、住房权益、投资账户、保险，是不同资产；把身家押在单一叙事（一只股、一个风口、一份不能丢的岗）等于未分散。四、费用与纪律是少数长期可控变量；热榜与「必须翻本」通常不是。",
      "阶段一：起步期（大约刚工作到三十出头）",
      "画像：人力资本高、金融资产薄；最贵的往往不是错过某只牛股，而是没有技能、没有信用记录、没有应急垫子。公开讨论里「年轻就该激进」常被说成满仓梭哈；教材味的说法更土——年轻时真正该「激进」的，多半是投资自己的可迁移能力与职业现金流，金融仓位可以偏成长，但前提是生活不会因回撤断裂。",
      "这一阶段的规划重点：把应急现金做成习惯（常见草稿是 3～6 个月必要开支，因行业稳定性加减）；还清或严格管理高息消费贷；开始极简单的长期账户（宽基、定投、自动扣款），目的是形成「先付给未来的自己」的肌肉，不是证明选股天才。若手痒要学交易，用模拟盘与小仓位练三问清单（结构／风险／失效），把学费限制在睡得着的范围内。站内：定投／复利工具只做保守假设；仓位工具回答「这笔亏得起多少」。",
      "阶段二：立业与成家窗口（大约三十到四十）",
      "画像：收入上升，刚性支出也上升——住房、生育、赡养可能叠在一起。机会成本变得刺眼：每一笔「故事股满仓」，放弃的是首付弹性、育儿缓冲与睡眠。此时最大的规划错误，往往是用短期要用的钱去博长期叙事，或反过来——所有钱都锁进「不敢动」的恐惧，错过本可承受的长期复利。",
      "规划重点：账户分层写清楚——生活现金、近 1～5 年大事专用、五年以上才碰的增值仓，互不挪用。大事专用（房、教育准备金）偏稳健与流动性；长期仓才讨论更高波动。保险在这里是「买不被迫卖出的权利」，不是理财产品橱窗。若已有集中持股（公司股权、单一热门股），承认这是未分散，用其他资产与现金去对冲生活风险，而不是再用杠杆加码同一赌注。对照《经济学怎么帮散户想清楚》里的机会成本与带宽：成家阶段带宽天然变窄，更要少刷热榜、少计划外加仓。",
      "阶段三：中年巩固期（大约四十到五十多）",
      "画像：薪酬可能接近平台，同时上有老下有小；回撤的痛苦从「少买包」变成「动教育金／医药预算」。教材提醒：你真正暴露的，是「消费与责任」这条负债流；投资组合要服务责任流，而不是反过来。许多人在这个阶段才第一次严肃面对：自己并没有比市场更稳的预测能力，却已经没有年轻时「再赚二十年工资补洞」的余裕。",
      "规划重点：重算足够线与责任清单（赡养、教育、自己的医疗缓冲）；逐步把「必须靠工资才能周转」的脆弱降下来——提高储蓄率、降低强制性消费攀比、检查是否在用短债支持长风险。资产配置上，常见方向是：保持全球／多资产分散的主干，降低单一主题与单一个股占比；组合再平衡写成年度日程，而不是行情情绪按钮。若仍做主动交易，仓位上限应随「不可替代责任」上升而下降——不是因为你突然变笨，而是容错变薄。复盘看行为（计划外次数、是否改失效），少看日净值面子。",
      "阶段四：临近退休与退休早期（大约五十多以后，因人而异）",
      "画像：人力资本变现窗口变短；序列风险（刚退休就碰上大熊市）会实质伤害提取计划。此时「还能不能回本」的叙事特别危险——带宽被时间压迫，系统 1 更容易接管。《投资学》不会给你神谕式撤离日；它提醒的是：支出覆盖与流动性，优先级高于名义收益率。",
      "规划重点：用「足够线 × 保守提取假设」做压力测试（见财富自由文对 FIRE／约 4% 的提醒：粗尺不是定律）；提高现金与短久期稳妥资产覆盖未来数年开支的比例，使你不必在恐慌里卖长期仓。工作若仍可选，把它当成灵活的人力资本期权，而不是耻辱。遗产、保险受益、账户过户等事务性安排，属于韧性，不是忌讳。交易上默认更少、更规则；任何「退休前最后一搏」都值得用三问清单拦下。",
      "一张可改的阶段对照（写进笔记即可）",
      "起步：应急垫子 + 还高息债 + 自动定投练纪律 + 模拟学规则。立业：三账户分层 + 大事钱不进高波动 + 保带宽。巩固：重算足够线与责任 + 降集中度 + 年度再平衡 + 降计划外交易。临退：覆盖与流动性优先 + 提取压力测试 + 少博弈序列风险。各阶段共通：分散人生组合、费用可见、失效与风险预算写下来。",
      "和《投资学》教材怎么对照读（可选，不要求通读）",
      "若你打开博迪那本厚书，不必从公式啃到尾。跳读「风险与收益、分散、有效市场争论、资产配置与生命周期」相关章节即可；衍生品与机构章节当词典查。书的价值是建立谦逊：定价模型解释风险从哪来，不保证你下个月赢。人生规划借它的是期限匹配与风险预算，不是把 CAPM 算成买点。",
      "站内怎么练（假设演算，不是达标承诺）",
      "一、写出你目前所处阶段，以及未来五年可能跨入的阶段（生育、购房、离职风险）。二、列出三账户：应急与生活、近五年大事、五年以上增值——每笔钱先贴标签再谈产品。三、用复利／定投工具做保守缺口估算；用仓位工具把「亏得起」算成数量。四、每月或每季只复盘一次：足够线有没有变、计划外交易几次、集中持仓是否过高。五、对照阅读：《财富自由到底是什么》《经济学怎么帮散户想清楚》《下单前三问清单》。",
      "收束：好的人生金钱规划，不是一张印到八十岁的仓位海报，而是承认约束会变——年轻时多投资人力资本与习惯，立业时保流动性与分层，中年时降集中、护责任，临退时护提取与睡眠。收益宣传永远在制造「单一最优比例」；《投资学》味的诚实是：比例随期限与风险预算改写，行为与缓冲决定你能不能活过完整周期。任何阶段都不保证暴富，只争取在周期里仍保有选择权——那已经比多数口号更接近长久。",
    ],
    "zh-TW": [
      "很多人問《投資學》講了什麼、人生怎麼規劃——其實是問：錢在不同年齡該承擔什麼角色。博迪教材給的是冷語言：收益補償風險、分散壓特質風險、期限決定扛得住什麼波動、年輕時人力資本往往是最大資產。遷到生活，就是按階段改組合，而不是一套口號用到老。",
      "邊界：下文按常見年齡段寫草稿，不是標準答案；城巿、家庭、健康都會改表。釘死足夠線、應急月數、虧得起與手段邊界。對照《財富自由到底是什麼》。僅供學習，非投資建議。",
      "四條硬規矩：先期限後產品；先風險預算後收益幻想；人生是組合（工作／現金／房／投資／保險）；費用與紀律可控，熱榜通常不可控。",
      "起步期：墊應急、管高息債、自動定投練紀律；激進優先給可遷移能力。想學交易用模擬與小倉練三問。立業成家：三帳戶分層——生活、近幾年大事、五年以上增值；大事錢不進高波動；保險買「不被迫賣出」的權利；少鎖死帶寬。",
      "中年鞏固：重算足夠線與責任；降單一主題／個股集中；年度再平衡；容錯變薄則主動倉位上限下降。臨退：覆蓋與流動性優先於名義報酬；提取做保守壓力測試；警惕「退休前最後一搏」與序列風險。",
      "站內：標好三帳戶→複利／定投保守估算→倉位算虧得起→定期複盤行為與集中度。書建立謙遜；規劃保選擇權，不保證暴富。",
    ],
    en: [
      "Questions about what Investments teaches and how to plan a life are really one question: what job should money do at each age? Bodie/Kane/Marcus give a cold language—return compensates risk; diversification shrinks idiosyncratic risk; horizon sets what volatility you can survive; when young, human capital is often the largest asset. Migrate that temper: change the mix by stage, don’t tattoo one slogan forever.",
      "Boundaries: age bands below are drafts, not answer keys. City, family, health rewrite the table. Nail an enough-line, emergency months, max loss, and forbidden tactics. Pair with the financial-freedom essay. Learning only—not advice.",
      "Four hard rules: horizon before product; risk budget before return fantasy; a life is a portfolio (job, cash, housing, investments, insurance); fees and discipline are controllable—heat lists usually aren’t.",
      "Early career: emergency buffer, kill high-interest consumer debt, automate a simple long-term contribution to build muscle—not to prove stock-picking genius. “Be aggressive young” often means invest in skills and cash-flow first. Paper and tiny size for trading lessons with the three-question checklist.",
      "Building / family years: three buckets—living cash, 1–5 year goals, 5+ year growth—no mixing. Goal money stays boring and liquid; only the long bucket debates higher volatility. Insurance buys the right not to fire-sale. Concentrated bets (employer stock, one hero ticker) are undiversified—hedge life risk elsewhere, don’t lever the same story.",
      "Midlife: recalculate the enough-line and duties; lower single-name and theme concentration; calendar rebalance; as irreplaceable duties grow, active risk caps shrink—not because you got dumber, because slack got thinner. Near retirement: coverage and liquidity beat headline yield; stress-test withdrawals conservatively; treat “one last gamble before I stop” as a checklist fail. Sequence risk is real.",
      "On Q-Stock: label the three buckets, run conservative compound/DCA math, size with “loss you can sleep with,” review behavior and concentration on a slow cadence. The textbook builds humility; a life plan protects optionality—it does not promise getting rich.",
    ],
  },
};
