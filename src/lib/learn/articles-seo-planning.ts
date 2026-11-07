import type { LearnArticle } from "@/lib/learn/types";

const AUTHOR = "钱力股研究组";
const PUBLISHED = "2026-11-07";

/**
 * 规划类工具簇：养老金与存款。
 *
 * 这两篇的共同点是「公式公开、口径模糊」——官方公式人人可查，但计发月数、
 * 缴费指数、靠档计息这些细节决定了结果差多少。文章只做一件事：
 * 把公式拆到能被逐项验证的程度，然后把人引到工具里代入自己的数。
 */
export const LEARN_ARTICLES_SEO_PLANNING: LearnArticle[] = [
  {
    slug: "pension-payout-formula",
    category: "tools",
    ctaHref: "/tools/pension",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "How much pension you will actually get: the formula is only three lines",
      "zh-CN": "退休后每月能领多少：养老金公式其实只有三行",
    },
    summary: {
      en: "Basic pension, personal account, payout divisor. Three lines explain the whole number — and they also explain why a 5x contribution index only buys a 2.5x basic pension, and why three more years of work is worth more than three more years of saving.",
      "zh-CN": "基础养老金、个人账户、计发月数，三行公式决定了你每月的数。它们同时解释了两件事：为什么缴费指数翻 5 倍，基础养老金只翻 2.5 倍；以及为什么多干三年，比多存三年更管用。",
    },
    paragraphs: {
      en: [
        "Most pension estimates give you a number and no way to check it. The official formula is not secret — it is short enough to write on one line.",
        "This article takes one concrete case, computes it end to end, and shows which of the three inputs actually moves the result.",
      ],
      "zh-CN": [
        "大部分养老金测算只给你一个数，不给你验证的路径。官方的计发公式并不是秘密，短到能写在一行里。",
        "这篇拿一个具体案例从头算到尾，然后看三个输入里，究竟哪个真的在决定结果。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "Take a 32-year-old man: contribution base 12,000, local average wage 8,000, six years already contributed, 60,000 in the personal account. Assume wages grow 3% a year, the average wage 2%, the account earns 2%, and he retires at the statutory age of 63. The result is 14,272 a month — a replacement rate of 47.6% against his salary at retirement.",
        },
        { type: "h2", text: "The whole formula, three lines" },
        {
          type: "ul",
          items: [
            "Basic pension = average wage at retirement × (1 + your contribution index) ÷ 2 × years contributed × 1%",
            "Personal account pension = account balance at retirement ÷ payout divisor for your retirement age",
            "Monthly pension = basic pension + personal account pension",
          ],
        },
        {
          type: "p",
          text: "Everything else — the phased delay in retirement age, the minimum contribution years, indexation after retirement — changes one of those three inputs. Nothing else is in the formula.",
        },
        { type: "h2", text: "Line one: a 5x index buys only 2.5x" },
        {
          type: "p",
          text: "Look at the bracket: (1 + index) ÷ 2. At the floor of 0.6 that is 0.8. At the 3.0 ceiling it is 2.0. So the basic pension of a top-bracket contributor is 2.5 times that of a minimum-bracket contributor — not five times. The ÷2 is a deliberate redistribution: half of the basic pension is tied to the pooled average, half to your own record.",
        },
        {
          type: "p",
          text: "In the case above, holding the base fixed and moving only the index from 0.6 to 3.0 takes the basic pension from 4,375 to 10,938. That 2.5x factor is a property of the formula, not of this particular person.",
        },
        {
          type: "note",
          text: "In reality a higher index comes from a higher contribution base, so the personal account grows too. The 2.5x applies to the basic pension line only — total pension grows faster.",
        },
        { type: "h2", text: "Line two: the account is small, the divisor is decisive" },
        {
          type: "p",
          text: "Only the 8% you contribute personally goes into the account. The employer's 16% goes to the pooled fund and never appears in your balance. In the case above, 31 more years of contributions turn 60,000 into about 870,000 at retirement — of which roughly 636,000 is your own money and the rest is accumulated interest.",
        },
        {
          type: "p",
          text: "Then that 870,000 is divided by 117, because at 63 the payout divisor is 117 months. The result is 7,436 a month. Divide the same balance by 139 (age 60) and you get 6,259 — a 1,177 difference from the divisor alone.",
        },
        { type: "h2", text: "Line three: the divisor is why delay pays" },
        {
          type: "p",
          text: "The divisor is not a payment limit — the pension is paid for life. It is an actuarial conversion factor: a smaller divisor means each month's payment is larger. Moving from 60 to 63 cuts it from 139 to 117, an 18.8% uplift on the same balance.",
        },
        {
          type: "table",
          caption:
            "Same contribution record, different retirement ages (base 12,000, index 1.5, average wage 8,000)",
          head: ["Retirement age", "Payout months", "Monthly pension", "Replacement rate"],
          rows: [
            ["55", "170", "7,844", "33.1%"],
            ["58", "152", "9,714", "37.5%"],
            ["60", "139", "11,249", "41.0%"],
            ["63", "117", "14,272", "47.6%"],
            ["65", "101", "17,049", "53.6%"],
            ["68", "75", "23,516", "67.6%"],
          ],
        },
        {
          type: "p",
          text: "Three more years of work from 60 to 63 is worth 3,023 a month, a 26.9% increase. Three forces stack: the divisor shrinks, the contribution years lengthen (each year adds one percentage point of the basic pension), and the account compounds once more while receiving contributions.",
        },
        {
          type: "p",
          text: "Nothing here argues that working longer is the right choice. It says the trade is priced: three years of your time buys a 26.9% permanent raise on a payment that lasts as long as you do. Whether that is a good price depends on your health and your alternatives — but it is a price, and it is computable.",
        },
        { type: "h2", text: "The number that matters is the replacement rate" },
        {
          type: "p",
          text: "14,272 sounds like a lot until you divide it by the 30,001 salary he would be earning at 63. That is 47.6%. The World Bank's long-standing rule of thumb puts the comfort threshold near 70% of pre-retirement income; below that, something else has to fund the gap.",
        },
        {
          type: "p",
          text: "High earners face a structural problem here. The contribution base is capped at 300% of the local average wage, so the index maxes out at 3.0 while salary keeps rising. A person earning five times the average wage does not get a five-times pension — the formula caps the upside and the replacement rate falls as income rises.",
        },
        { type: "h2", text: "Three places estimates go wrong" },
        {
          type: "ul",
          items: [
            "Transitional pension omitted. Anyone who started work before the personal account system was set up (mid-1990s, varies by province) has deemed contribution years that add a separate transitional pension. Ignoring it understates the result.",
            "Base above the cap not handled. Contribution base above 300% of the local average wage is not counted. A calculator that accepts it without warning overstates the pension.",
            "Account balance taken from memory. The real figure is on the social insurance statement or the e-social-security card. An estimated balance can be off by tens of thousands, and the divisor turns every 117,000 of error into 1,000 a month.",
          ],
        },
        {
          type: "note",
          text: "Scope: employee basic pension only, excluding transitional pension and deemed contribution years. Payout divisors follow the current national table (63 → 117 months); whether the table is revised alongside the delayed retirement schedule is a policy question, not an arithmetic one. Use the result to understand structure, not as a certified amount.",
        },
        { type: "h2", text: "What to do with the number" },
        {
          type: "p",
          text: "Two uses. First, treat the replacement rate as a gap to be filled: if the formula delivers 47.6% and you want 70%, the missing 22.4% has to come from the second and third pillars — an enterprise annuity, a personal pension account, or plain long-term investing. Second, treat the retirement-age table as a sensitivity check: it tells you how much of your outcome is decided by a decision you actually control.",
        },
        {
          type: "p",
          text: "Run your own figures in the pension calculator. The inputs that matter most are the ones you can look up rather than guess — contribution years and account balance.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "先看一个具体的人：32 岁男性，月缴费基数 12,000，当地月社平工资 8,000，已缴 6 年，个人账户余额 6 万。假设工资年增 3%、社平年增 2%、记账利率 2%，按改革后的法定年龄 63 岁退休。结果是每月 14,272 元，相对退休前月薪的替代率 47.6%。",
        },
        { type: "h2", text: "整个公式，三行就写完" },
        {
          type: "ul",
          items: [
            "基础养老金 = 退休时上年度月社平工资 ×（1 + 本人平均缴费指数）÷ 2 × 缴费年限 × 1%",
            "个人账户养老金 = 退休时个人账户储存额 ÷ 退休年龄对应的计发月数",
            "月养老金 = 基础养老金 + 个人账户养老金",
          ],
        },
        {
          type: "p",
          text: "其余所有的政策——渐进式延迟退休、最低缴费年限提高、退休后的年度调整——都只是在改这三个输入里的某一个。公式本身没有第四行。",
        },
        { type: "h2", text: "第一行：指数翻 5 倍，基础养老金只翻 2.5 倍" },
        {
          type: "p",
          text: "关键在那个括号：（1 + 指数）÷ 2。按下限 0.6 算，括号里是 0.8；按上限 3.0 算，是 2.0。所以顶格缴费的人，基础养老金是最低档的 2.5 倍，不是 5 倍。这个「除以 2」是设计出来的再分配——一半跟社会平均挂钩，一半跟你自己的记录挂钩。",
        },
        {
          type: "p",
          text: "在上面那个案例里，基数和年限都不动，只把指数从 0.6 调到 3.0，基础养老金从 4,375 元变成 10,938 元。这个 2.5 倍是公式的性质，跟具体是谁无关。",
        },
        {
          type: "note",
          text: "现实中更高的指数来自更高的缴费基数，个人账户也会同步变多。2.5 倍只适用于基础养老金这一项，总养老金的差距会更大。",
        },
        { type: "h2", text: "第二行：账户不大，计发月数才要命" },
        {
          type: "p",
          text: "只有你自己缴的 8% 进个人账户，单位缴的 16% 进统筹，不会出现在你的余额里。上面那个案例，再缴 31 年，账户从 6 万变成约 87 万——其中约 63.6 万是本金，其余是记账利息滚出来的。",
        },
        {
          type: "p",
          text: "然后这 87 万要除以 117，因为 63 岁对应的计发月数是 117 个月。除出来是每月 7,436 元。同一笔余额如果按 60 岁的 139 个月除，是 6,259 元——仅仅因为计发月数不同，每月差 1,177 元。",
        },
        { type: "h2", text: "第三行：计发月数就是延迟退休的定价" },
        {
          type: "p",
          text: "计发月数不是「只能领这么多个月」，养老金是终身发放的。它只是一个精算折算系数：除数越小，每月领得越多。从 60 岁推到 63 岁，除数从 139 降到 117，同一笔余额每月多出 18.8%。",
        },
        {
          type: "table",
          caption: "同一份缴费记录，换不同退休年龄（基数 12,000、指数 1.5、社平 8,000）",
          head: ["退休年龄", "计发月数", "月养老金", "替代率"],
          rows: [
            ["55", "170", "7,844", "33.1%"],
            ["58", "152", "9,714", "37.5%"],
            ["60", "139", "11,249", "41.0%"],
            ["63", "117", "14,272", "47.6%"],
            ["65", "101", "17,049", "53.6%"],
            ["68", "75", "23,516", "67.6%"],
          ],
        },
        {
          type: "p",
          text: "从 60 岁干到 63 岁，每月多 3,023 元，涨幅 26.9%。三股力量在叠加：除数变小、缴费年限变长（每多一年，基础养老金多一个百分点）、账户又多存又复利了三年。",
        },
        {
          type: "p",
          text: "这不是在说延迟退休划算。它只是在说，这个交换是有标价的：三年时间，换一份终身有效、每月高 26.9% 的现金流。这个价格值不值，取决于你的健康和别的选择——但它是价格，就能算。",
        },
        { type: "h2", text: "真正该看的是替代率" },
        {
          type: "p",
          text: "14,272 听起来不少，直到你把它除以 63 岁时的月薪 30,001。那是 47.6%。世界银行长期沿用的经验线把「维持退休前生活水平」放在 70% 附近；低于这条线，缺口得有别的来源。",
        },
        {
          type: "p",
          text: "高收入者在这里会遇到一个结构性问题：缴费基数按当地社平工资的 300% 封顶，所以指数最高 3.0，而工资还在涨。一个月薪是社平五倍的人，拿不到五倍的养老金——公式封住了上限，收入越高，替代率越低。",
        },
        { type: "h2", text: "估算最容易错的三处" },
        {
          type: "ul",
          items: [
            "漏掉过渡性养老金。在个人账户制度建立前（各省多在 1990 年代中）参加工作的人，有视同缴费年限，会另算一笔过渡性养老金。漏掉就低估。",
            "没处理 300% 封顶。缴费基数超过社平 300% 的部分不计入，一个不做提示的计算器会把结果算高。",
            "账户余额凭印象填。真实数字在社保个人权益单或电子社保卡里。余额估错几万，除以 117 之后就是每月差几百上千。",
          ],
        },
        {
          type: "note",
          text: "口径说明：仅测算企业职工基本养老保险，不含过渡性养老金与视同缴费年限。计发月数取现行全国统一表（63 岁为 117 个月）；延迟退休后该表是否调整属于政策问题，不是算术问题。结果用于理解结构，不作为核定金额。",
        },
        { type: "h2", text: "算出这个数之后做什么" },
        {
          type: "p",
          text: "两个用途。一是把替代率当成缺口：如果公式只给 47.6%，而你想要 70%，差的 22.4% 必须由第二、第三支柱补——企业年金、个人养老金账户，或者干脆是长期投资。二是把退休年龄那张表当成敏感性检查：它告诉你，结果里有多大一块是由你实际能决定的那个变量控制的。",
        },
        {
          type: "p",
          text: "拿你自己的数去养老金计算器跑一遍。最值得花时间核对的不是假设，而是能查到的那两项：缴费年限和账户余额。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Is the payout divisor a cap on how many months I can receive?",
          a: "No. The pension is paid for life. The divisor only converts the account balance into a monthly amount; once the account is exhausted, payments continue from the pooled fund.",
        },
        {
          q: "Why does my pension go up if I retire later, when I also collect for fewer years?",
          a: "Because three things move at once: a smaller divisor, more contribution years, and a larger account. In the example, retiring at 63 instead of 60 raises the monthly amount 26.9%. Whether you come out ahead overall depends on how long you live — the break-even is around 73 for the personal account.",
        },
        {
          q: "Does the 2.5x rule mean contributing more is pointless?",
          a: "No. It means the basic pension line is only partly proportional. A higher base also grows the personal account, which is fully yours, so total pension scales faster than 2.5x. The 2.5x is the redistribution built into one specific line.",
        },
        {
          q: "I contributed in several cities. How is that handled?",
          a: "Contribution years and account balances are combined when you transfer your relationship to the city where you retire. The average wage used is the one at the retirement location, so where you finally settle materially changes the basic pension.",
        },
        {
          q: "Can the statutory retirement age in the calculator be wrong for me?",
          a: "It is approximated from birth year, so boundary cases can differ by a month. The authoritative figure comes from the social insurance office. Treat the calculator value as a default you can override.",
        },
      ],
      "zh-CN": [
        {
          q: "计发月数是领取上限吗？领完 117 个月就没有了？",
          a: "不是。养老金终身发放。计发月数只是把账户余额折算成每月金额的系数，个人账户领完之后，继续由统筹基金支付。",
        },
        {
          q: "晚退休领的月数更少，为什么月养老金反而更高？",
          a: "因为三件事同时发生：除数变小、缴费年限变长、账户余额变大。案例里 63 岁比 60 岁每月高 26.9%。总量上是否划算取决于寿命——仅就个人账户而言，回本点大约在 73 岁。",
        },
        {
          q: "既然只翻 2.5 倍，多缴是不是没意义？",
          a: "不是。2.5 倍说的是基础养老金这一项的分配设计。基数高同时会让个人账户变大，而那部分完全归你，所以总养老金的差距大于 2.5 倍。",
        },
        {
          q: "在多个城市缴过社保，怎么算？",
          a: "办理关系转移后，缴费年限和个人账户余额会合并计算；但基础养老金用的是退休地的社平工资，所以最终在哪里退休，会实质影响这一项。",
        },
        {
          q: "工具里算出的法定退休年龄一定准吗？",
          a: "它是按出生年份近似推算的，边界年份可能差一个月。权威数字以社保经办机构核定为准，工具里的值可以手动改。",
        },
      ],
    },
    links: {
      en: [
        { label: "Pension calculator", href: "/tools/pension" },
        { label: "Compound calculator", href: "/tools/compound" },
        { label: "DCA vs lump sum", href: "/learn/lump-sum-vs-dca" },
        { label: "Deposit interest and early withdrawal", href: "/learn/deposit-interest-and-early-withdrawal" },
        { label: "Three statements, one story", href: "/learn/financials-three-statements" },
      ],
      "zh-CN": [
        { label: "养老金计算器", href: "/tools/pension" },
        { label: "复利计算器", href: "/tools/compound" },
        { label: "定投与一次性投入", href: "/learn/lump-sum-vs-dca" },
        { label: "存款利息与提前支取", href: "/learn/deposit-interest-and-early-withdrawal" },
        { label: "财务三表怎么读", href: "/learn/financials-three-statements" },
      ],
    },
    sourceNote: {
      en: "Formula per the national employee basic pension scheme; payout divisors from the national table; statutory retirement ages approximated from the phased delay effective 2025. Example figures are computed, not quoted.",
      "zh-CN": "公式依据国家企业职工基本养老保险计发办法；计发月数取全国统一表；法定退休年龄按 2025 年起实施的渐进式延迟办法近似推算。文中数字为计算结果，非引用。",
    },
  },
  {
    slug: "deposit-interest-and-early-withdrawal",
    category: "tools",
    ctaHref: "/tools/deposit",
    author: AUTHOR,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    title: {
      en: "Deposit interest: the day early withdrawal costs you 96%",
      "zh-CN": "存款利息怎么算：提前支取那一天，你损失了 96%",
    },
    summary: {
      en: "A 3-year fixed deposit pays simple interest, and withdrawing one month early does not cost you one month of interest — it costs you almost all of it, because tiered rates are gone and the whole balance falls back to the demand rate. Then inflation takes another bite.",
      "zh-CN": "三年期定存按单利计息。提前一个月取出来，损失的不是一个月利息，而是几乎全部——靠档计息已取消，整笔钱按活期重算。通胀再咬一口，名义 1.25% 会变成实际负收益。",
    },
    paragraphs: {
      en: [
        "100,000 in a 3-year fixed deposit at 1.25% earns 3,750 over the term. Withdraw it in month 35 — one month before maturity — and you get 146.",
        "That is not a penalty fee. It is the rule: no tiered rates, the whole balance re-priced at the demand rate.",
      ],
      "zh-CN": [
        "10 万元存三年期，利率 1.25%，到期利息 3,750 元。如果在第 35 个月取出——离到期只差一个月——利息是 146 元。",
        "这不是罚息。这是规则本身：靠档计息已取消，整笔钱按活期重算。",
      ],
    },
    sections: {
      en: [
        {
          type: "p",
          text: "Fixed deposits are quoted as an annual rate but settle as simple interest: interest = principal × annual rate × term in years. There is no compounding inside a single term. That is why the headline rate and the realised annualised return are not the same number once you roll the deposit over several times.",
        },
        { type: "h2", text: "Line one: simple interest, no compounding" },
        {
          type: "table",
          caption: "100,000 principal, major-bank published rates",
          head: ["Term", "Rate", "Interest at maturity", "Real annual (1.5% inflation)"],
          rows: [
            ["3 months", "0.65%", "163", "−0.84%"],
            ["6 months", "0.85%", "425", "−0.64%"],
            ["1 year", "0.95%", "950", "−0.54%"],
            ["2 years", "1.05%", "2,100", "−0.45%"],
            ["3 years", "1.25%", "3,750", "−0.26%"],
            ["5 years", "1.30%", "6,500", "−0.23%"],
          ],
        },
        {
          type: "p",
          text: "Read the last column carefully. Every term is negative in real terms once inflation runs at 1.5%. The longer terms are less negative, but none of them is positive. A deposit at these rates preserves the number in the account and slowly loses purchasing power.",
        },
        { type: "h2", text: "Line two: early withdrawal re-prices everything" },
        {
          type: "p",
          text: "Chinese regulation used to allow tiered interest — withdraw in month 35 of a 36-month deposit and you might be paid at the 2-year rate. That practice has been discontinued. Under the current rule, the amount withdrawn early earns the demand rate for the entire holding period, and the demand rate is 0.05%.",
        },
        {
          type: "p",
          text: "So: 100,000 × 0.05% × 35/12 = 146. Against 3,750 at maturity, that is a 96.1% loss of interest. One month early, 96% gone. The shape of this rule matters more than the rate: it is a cliff, not a slope.",
        },
        {
          type: "table",
          caption: "Same deposit, withdrawal at different points",
          head: ["Withdrawal", "Interest received", "Share of full interest"],
          rows: [
            ["Month 35 (one month early)", "146", "3.9%"],
            ["Month 24", "100", "2.7%"],
            ["Month 12", "50", "1.3%"],
            ["Month 36 (maturity)", "3,750", "100%"],
          ],
        },
        { type: "h2", text: "Line three: partial withdrawal is the tool you want" },
        {
          type: "p",
          text: "The regulation has an exception that most people never use: partial early withdrawal. The amount you take out earns the demand rate, but the remainder keeps the original term and the original rate. Most banks allow this once per deposit.",
        },
        {
          type: "p",
          text: "Concretely: if you need 30,000 in month 35, withdrawing it partially means that 30,000 earns 44 instead of 1,094 — about 1,050 less — while the other 70,000 still matures at 1.25% and pays 2,625. Closing the whole deposit and re-depositing the remainder would have cost you the entire 3,750.",
        },
        {
          type: "note",
          text: "Partial withdrawal is usually limited to once per certificate, and some banks require it at the counter rather than in the app. Worth confirming before you need it, not after.",
        },
        { type: "h2", text: "Why the 5-year term is barely worth it" },
        {
          type: "p",
          text: "Three years pays 1.25%, five years pays 1.30%. The term premium for two extra years of lock-up is 5 basis points — 50 yuan a year on 100,000. In exchange you give up the option to re-price if rates rise, and you extend the early-withdrawal cliff by two years.",
        },
        {
          type: "p",
          text: "Several banks have also shown inverted curves, with the 5-year rate at or below the 3-year. When the term premium is zero or negative, the long lock-up has no compensation at all — you are taking duration risk for free.",
        },
        { type: "h2", text: "Rolling versus locking in" },
        {
          type: "p",
          text: "Rolling a 1-year deposit three times at 0.95% compounds to about 2,877 of interest on 100,000. Locking in 3 years at 1.25% gives 3,750. The difference — 873 yuan over three years — is the price of having the money available every 12 months instead of every 36.",
        },
        {
          type: "p",
          text: "That is the actual decision, and it is not a rate question. It is: how likely is it that you will need this money inside three years, and what does an early exit cost if you are wrong? Given a 96% interest loss on early exit, a ladder — splitting the sum into 1, 2 and 3-year deposits — usually beats both extremes.",
        },
        { type: "h2", text: "The comparison that is usually missing" },
        {
          type: "p",
          text: "A deposit's only real advantage is nominal certainty: the number at maturity is fixed and insured. Everything else is a cost. At 1.25% against 1.5% inflation, that certainty is purchased with a negative real return.",
        },
        {
          type: "p",
          text: "This is not an argument to abandon deposits — the emergency fund belongs there. It is an argument to size the deposit correctly: enough for certainty and liquidity, not so much that inflation quietly does the work of a loss.",
        },
        {
          type: "note",
          text: "Rates are major-bank published rates and change with each adjustment; use the rate on the day you deposit. Interest income tax has been waived since 9 October 2008, so no tax is modelled. Figures are computed, not quoted.",
        },
      ],
      "zh-CN": [
        {
          type: "p",
          text: "定期存款报的是年利率，结的是单利：利息 = 本金 × 年利率 × 存期（年）。一个存期内不滚利。这也是为什么「挂牌利率」和你滚存几次之后的实际年化回报，往往不是同一个数。",
        },
        { type: "h2", text: "第一层：单利，存期内不滚利" },
        {
          type: "table",
          caption: "本金 10 万元，按国有大行挂牌利率",
          head: ["存期", "利率", "到期利息", "实际年化（通胀 1.5%）"],
          rows: [
            ["3 个月", "0.65%", "163", "−0.84%"],
            ["6 个月", "0.85%", "425", "−0.64%"],
            ["1 年", "0.95%", "950", "−0.54%"],
            ["2 年", "1.05%", "2,100", "−0.45%"],
            ["3 年", "1.25%", "3,750", "−0.26%"],
            ["5 年", "1.30%", "6,500", "−0.23%"],
          ],
        },
        {
          type: "p",
          text: "看最后一列。通胀 1.5% 的前提下，每一个期限的实际年化都是负的。期限越长负得越少，但没有一个是正的。按这些利率存钱，账户里的数字被保住了，购买力在缓慢流失。",
        },
        { type: "h2", text: "第二层：提前支取会重算整笔" },
        {
          type: "p",
          text: "过去有「靠档计息」：三年期存到第 35 个月取出，可以按两年期利率算。这个做法已经取消。现行规则是，提前支取的部分按支取日活期利率计息，活期是 0.05%。",
        },
        {
          type: "p",
          text: "于是：100,000 × 0.05% × 35/12 = 146 元。相比到期的 3,750 元，损失 96.1%。只差一个月，96% 没了。这条规则的形状比利率本身更重要——它是悬崖，不是斜坡。",
        },
        {
          type: "table",
          caption: "同一笔存款，在不同时点取出",
          head: ["取出时点", "实得利息", "占到期利息"],
          rows: [
            ["第 35 个月（差一个月到期）", "146", "3.9%"],
            ["第 24 个月", "100", "2.7%"],
            ["第 12 个月", "50", "1.3%"],
            ["第 36 个月（到期）", "3,750", "100%"],
          ],
        },
        { type: "h2", text: "第三层：部分提前支取才是该用的工具" },
        {
          type: "p",
          text: "规则里有一个大多数人没用过的口子：部分提前支取。取出来的那部分按活期算，剩下的部分仍按原存期、原利率计息。多数银行允许每笔存款办一次。",
        },
        {
          type: "p",
          text: "具体说：第 35 个月需要 3 万，部分支取让这 3 万按活期算——实得 44 元，比定期应得的 1,094 元少 1,050——另外 7 万照常按 1.25% 到期，拿 2,625 元。如果整笔取出再转存，3,750 元全没了。",
        },
        {
          type: "note",
          text: "部分提前支取通常每笔限办一次，部分银行要求柜台办理而非 App。值得在需要用钱之前确认，而不是之后。",
        },
        { type: "h2", text: "五年期为什么不值" },
        {
          type: "p",
          text: "三年期 1.25%，五年期 1.30%。多锁两年换来的期限溢价是 5 个基点——10 万元一年 50 元。代价是放弃利率上行时重新定价的机会，同时把「提前支取悬崖」又拉长了两年。",
        },
        {
          type: "p",
          text: "部分银行还出现过利率倒挂，五年期等于甚至低于三年期。当期溢价为 0 或为负时，长锁定期没有任何补偿——你白担了久期。",
        },
        { type: "h2", text: "滚存还是锁死" },
        {
          type: "p",
          text: "10 万元按 1 年期 0.95% 滚三次，复利后利息约 2,877 元。一次锁三年按 1.25%，是 3,750 元。差 873 元，这就是「每 12 个月能动一次」相对「36 个月不能动」的价格。",
        },
        {
          type: "p",
          text: "这才是真正的决策，而且它不是利率问题，是：三年内你用上这笔钱的概率有多大，猜错一次的代价是多少。在提前支取要损失 96% 利息的前提下，阶梯存法——把一笔钱拆成 1 年、2 年、3 年三份——通常比两个极端都好。",
        },
        { type: "h2", text: "通常被漏掉的那个对照" },
        {
          type: "p",
          text: "存款唯一真正的优势是名义确定性：到期数字是固定的，且有存款保险。其余都是成本。1.25% 对 1.5% 的通胀，这份确定性是用负的实际收益买来的。",
        },
        {
          type: "p",
          text: "这不是劝你别存钱——应急金本来就该放在这里。它说的是把额度放对：够应付确定性和流动性就行，别多到让通胀替你把亏损慢慢做完。",
        },
        {
          type: "note",
          text: "利率为国有大行挂牌水平，每次调整都会变，请按办理当日实际利率计算。储蓄存款利息所得自 2008 年 10 月 9 日起暂免征收个人所得税，故未计税。文中数字为计算结果，非引用。",
        },
      ],
    },
    faq: {
      en: [
        {
          q: "Is early withdrawal really re-priced at the demand rate for the whole period?",
          a: "Yes. Tiered interest (靠档计息) has been discontinued. The amount withdrawn early earns the demand rate from the deposit date, not from a later tier. That is why the loss is a cliff rather than a gradual taper.",
        },
        {
          q: "Can I withdraw only part of a fixed deposit?",
          a: "Usually yes, once per certificate. The withdrawn portion earns the demand rate; the remainder keeps the original term and rate. Some banks require this at the counter.",
        },
        {
          q: "Why is the real return negative when the rate is positive?",
          a: "Real return ≈ nominal minus inflation. At 1.25% nominal and 1.5% inflation, real is about −0.26% a year. The account balance grows; what it can buy does not.",
        },
        {
          q: "Does auto-renewal keep my original rate?",
          a: "No. Renewed deposits are priced at the rate in effect on the renewal date. In a falling-rate environment, auto-renewal quietly locks in a lower rate — worth checking each time.",
        },
        {
          q: "Is interest on deposits taxed?",
          a: "Interest income from savings deposits has been exempt from individual income tax since 9 October 2008. No tax is modelled here.",
        },
      ],
      "zh-CN": [
        {
          q: "提前支取真的整笔都按活期算吗？",
          a: "是的。靠档计息已经取消，提前支取的部分从存入日起就按活期利率计息，不再按已存期限靠档。所以损失是悬崖式的，不是逐级递减的。",
        },
        {
          q: "可以只取一部分吗？",
          a: "通常可以，每笔存款限办一次。取出的部分按活期计息，剩余部分保留原存期和原利率。部分银行要求柜台办理。",
        },
        {
          q: "利率是正的，为什么实际收益是负的？",
          a: "实际收益约等于名义利率减通胀。1.25% 对 1.5%，实际约 −0.26%/年。账户里的数字在涨，能买到的东西在少。",
        },
        {
          q: "自动转存会沿用原来的利率吗？",
          a: "不会。转存按转存当日的挂牌利率执行。在利率下行期，自动转存会安静地把你的利率换成更低的那个，每次都值得看一眼。",
        },
        {
          q: "存款利息要交税吗？",
          a: "储蓄存款利息所得自 2008 年 10 月 9 日起暂免征收个人所得税，所以这里没有计税。",
        },
      ],
    },
    links: {
      en: [
        { label: "Deposit calculator", href: "/tools/deposit" },
        { label: "Compound calculator", href: "/tools/compound" },
        { label: "Pension payout formula", href: "/learn/pension-payout-formula" },
        { label: "DCA vs lump sum", href: "/learn/lump-sum-vs-dca" },
        { label: "Risk, reward and expectancy", href: "/learn/risk-reward-expectancy" },
      ],
      "zh-CN": [
        { label: "存款利息计算器", href: "/tools/deposit" },
        { label: "复利计算器", href: "/tools/compound" },
        { label: "养老金领取测算", href: "/learn/pension-payout-formula" },
        { label: "定投与一次性投入", href: "/learn/lump-sum-vs-dca" },
        { label: "风险回报比与期望值", href: "/learn/risk-reward-expectancy" },
      ],
    },
    sourceNote: {
      en: "Rates reference major-bank published fixed-deposit rates; early-withdrawal rules follow the discontinuation of tiered interest. Figures computed with the deposit calculator.",
      "zh-CN": "利率参考国有大行整存整取挂牌水平；提前支取规则依据靠档计息取消后的现行做法。数字由存款计算器计算得出。",
    },
  },
];
