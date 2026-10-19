import type { LearnArticle } from "@/lib/learn/types";

/**
 * Deep mindset essay: Tao Te Ching × greed / fear / desire in markets.
 * Kept in its own module so articles-mindset.ts stays under the line limit.
 */
export const LEARN_ARTICLE_DAO_GREED_FEAR: LearnArticle = {
  slug: "dao-greed-fear-desire",
  category: "mindset",
  ctaHref: "/learn/checklist-three",
  title: {
    "zh-CN": "道德经看贪婪、恐惧与欲望：投资里如何自处",
    "zh-TW": "道德經看貪婪、恐懼與欲望：投資裡如何自處",
    en: "Tao Te Ching on greed, fear, and desire in investing",
  },
  summary: {
    "zh-CN":
      "分章对照欲望、贪婪、恐惧，写清链条、误读与一套可复盘的知足／知止流程。",
    "zh-TW":
      "分章對照欲望、貪婪、恐懼，寫清鏈條、誤讀與一套可複盤的知足／知止流程。",
    en: "Chapter-level maps of desire, greed, and fear—plus a reviewable enough/stop process.",
  },
  paragraphs: {
    "zh-CN": [
      "行情放大人性：涨时怕踏空，跌时怕归零，中间又总想「再多一点」。贪婪、恐惧、欲望不是用来骂人的道德标签，而是交易决策里反复出现的推力——它们会改写你看见什么、敢不敢停手、愿不愿承认计划作废。《道德经》成书远早于证券交易所，却把这三种推力写得很早。读它，是为了给冲动一套更古老、也更冷的语言；不是为了从经文里抠出买卖点或玄学开单口诀。",
      "先立边界：本文是心态与流程短文，不是投资建议，也不保证收益。经文引述取常见通行本意涵，便于对照行为；不做训诂考据。若你把「无为」理解成躺平等暴富，或把「知足」理解成永远不满仓——那是误读，后面会专门拆。",
      "一、欲望：看见「可欲」之前，心已经乱了",
      "第三章讲「不见可欲，使民心不乱」；第十二章讲「五色令人目盲，五音令人耳聋，五味令人口爽，驰骋畋猎令人心发狂」。翻译到今天的行情界面：涨跌色、热榜、短讯、别人的截图盈亏、群里的口号，都是被精心堆到眼前的「可欲」。欲望本身不等于罪恶——想改善生活、想学习市场，都正当。问题在于：可欲过量时，注意力被劫走，你还没问结构、价位、失效，身体已经先进入「该不该追」的备战状态。",
      "欲望在盘中常见的三种面孔：一是比较欲——别人赚了你没赚，痛苦往往大于自己账户的真实变化；二是叙事欲——需要一个「故事」证明自己聪明（题材、内幕感、AI 一句「偏向多」）；三是活动欲——空仓焦虑，觉得「今天必须干一笔」才算参与。三者都会把信息消费伪装成研究：刷得越多，越像在努力，其实越接近第十二章说的「心发狂」。",
      "经里还有一句常被忽略的刹车：「持而盈之，不如其已」（第九章）——杯子已满还要倒，不如适时停止。欲望催促你「再看一眼热榜」「再加一个自选」「再问一次会不会涨」。每一次「再」，都在抬高你动手的概率，却未必抬高判断质量。欲望的对手不是禁欲苦行，而是降低刺激密度：交易时段关掉无关热榜与群聊；研究时段与下单时段分开；把「可欲」从默认推送改成你主动检索。",
      "二、贪婪：不知足则辱，不知止则殆",
      "第四十四章：「知足不辱，知止不殆，可以长久。」第九章又说「金玉满堂，莫之能守；富贵而骄，自遗其咎」。贪婪在市场里很少自称贪婪，它更常伪装成雄心、成长、效率——「再加一点仓才对得起判断」「趋势这么强不住满仓可惜」「这次一定翻倍补回前面」。不知足，再好的行情也会被杠杆与重仓毁掉；不知止，盈利单也会变成回吐机器。市场短期可以奖励大胆，长期惩罚的是「撑不住」：撑不住回撤、撑不住规则、撑不住自己的睡眠。",
      "贪婪有三个高发窗口，值得单独记账：一、浮盈扩大时——把纸面利润当成已到手的勋章，仓位只加不减，失效条件悄悄后移；二、连续盈利后——自信膨胀，风险预算被「手感」替换；三、大亏之后——报复性加仓，想一次性翻本，这时贪婪与恐惧绑在一起，破坏力最大。复盘时不要只写「我太贪了」，要写清发生在哪个窗口、当时改了哪条事先规则。",
      "「知足」在交易里必须可写、可检：这笔赚到什么算完成？完成是价格、是波动幅度、还是时间到期？「知止」同样必须可触发：什么价位或条件出现，计划作废、仓位降级或清掉？没有写下来的知足与知止，盘中一定会被改写成「再等等」「再看看」。知足是边界，知止是刹车——边界规定你要什么，刹车规定你不要什么。",
      "三、恐惧：宠辱若惊，得失绑在面子上",
      "第十三章：「宠辱若惊……得之若惊，失之若惊。」把荣辱得失系在心上，一惊一乍。账户里的版本是：浮盈当勋章，浮亏当羞辱；涨了怕回调「卖飞」而迟迟不按计划减仓，跌了怕继续跌而瘫痪，或反过来用加仓证明「我不怕」。恐惧若用来保护本金与睡眠，是警戒，接近「知止」；若用来保护面子与叙事连贯性，就会打乱计划——该停不停、该不动乱动。",
      "恐惧也分型，混在一起只会更乱：一、损失恐惧——亏钱本身的痛（损失厌恶）；二、后悔恐惧——怕踏空、怕「本来可以」；三、评价恐惧——怕别人（或未来的自己）觉得蠢。后悔恐惧常在大涨后逼你追高；评价恐惧常在大亏后逼你隐瞒、不复盘、或加仓掩饰。经文提醒的不是「不要怕」，而是别把自我价值与一笔单的宠辱捆死。怕亏可以；怕丢脸而改规则，才是致命的。",
      "四、三者如何串成一条链（比单独骂「心态差」有用）",
      "多数失控单不是「突然变蠢」，而是链条：欲望打开想象（热榜、故事、别人盈亏）→ 贪婪放大仓位或延长持有（再多一点）→ 波动到来时恐惧接管（硬扛、报复、或乱砍）。所以只骂「别贪」几乎无效——你要在链条上拆环节：前端减少可欲刺激；中端规定足够与停止；后端给恐惧合法出口（失效、风险预算、事先写好的减仓），而不是盘中即兴硬扛或硬冲。",
      "用一笔虚构但典型的路径自检：早上看见题材热、群里截图（欲望）→ 觉得「不买就落后」，计划外加仓（贪婪）→ 午后回撤，告诉自己「洗盘」（恐惧改写失效）→ 尾盘加速下跌，要么冻结要么翻倍摊平。复盘时把箭头画出来，比写「心态不好」更能改进行为。下次清单只改链条上的一环：例如「题材热榜日不加仓」或「失效价不许盘中后移」。",
      "五、启发：无为不是躺平，是少妄为",
      "「无为」常被误读成什么都不做。更接近经旨的是：少强迫、少妄为——不强求每笔都做，不把预测当成掌控，不在信息噪声里表演勤奋。第二十二章「曲则全，枉则直」也提醒：能弯曲（认错、降仓、改判断）的人，反而更容易保全。上善若水（第八章）落在仓位上，是柔软可退：错了也睡得着，比「看对却重仓失眠」更接近长久。为学日益，为道日损（第四十八章）——学行情可以日益增加框架；修道式的交易则要日渐减掉无用动作：少一个无关指标、少一次无计划刷新、少一句无法验证的叙事。",
      "还有一种误读要避开：用「道法自然」为惰性辩护——该做的规则功课不做，亏了说「随缘」。自然不是放任；知足知止恰恰是人为的纪律，用来对抗自然涌现的冲动。经典给人语言与态度，不给人收益保证；能长期待在市场里的人，往往不是欲望最少的人，而是最先为自己装上边界与刹车的人。",
      "六、怎么避免——一套可执行、可复盘的流程",
      "开盘前（减少欲望）：写下今日是否允许交易；若允许，只看事先自选与计划标的，不打开热榜逛吃。用一句话写出「今天什么都不做也算完成」——这是对活动欲的反制。",
      "计划时（落实知足）：每笔潜在交易写清完成条件与风险预算，两者同级，禁止只写「上看空间」。完成条件可以是：触及阻力减半、达到 R 倍数减仓、或持有满 N 个交易日复评。写不清完成条件，就还没到动手阶段。",
      "计划时（落实知止）：失效价或失效条件写入备注／提醒；打到就停手复核，不许盘中改规则。知止包括三种动作：减仓、退出、今日不再开新仓——事先选好默认动作，避免恐惧来时现场发明。",
      "盘中（少私寡欲）：固定问结构、价位、失效（见《下单前三问清单》）；答不上来就不加仓、不追单。把刷新行情的频率降下来：有提醒盯计划位，比肉眼刷屏更接近「不见可欲」。",
      "收盘后（看见恐惧与贪婪）：复盘只记行为，不记面子。固定三问：今天欲望从哪进来（热榜／群／AI／无聊）？贪婪是否改了仓位或失效？恐惧是否让我该动不动、该停不停？下周只改一条护栏。钱力股可用模拟盘练「知止」、用提醒绑计划位、用仓位工具把「亏得起」算成数量；AI 读图若帮你把结构说清楚，是助学——若被当成欲望燃料，就先关掉。",
      "七、常见误区（读经却更糟的情况）",
      "一、把知足当成永远不做——逃避决策也是一种恐惧。知足是完成线，不是禁止线。二、把知止当成「跌了就死扛等回来」——那是恐惧的反面词包装。三、用经文羞辱自己「修养不够」却不改流程——标签不产生边界。四、在极端行情用「大道」合理化重仓——越是叙事沸腾，越要回到风险预算。五、读了文章却不写一张自己的知足／知止卡——没有外挂大脑，盘中仍会回到链条默认路径。",
      "收束：贪婪、恐惧、欲望不会消失，只能被命名、被降级、被流程约束。经文提供的不是仙术，而是更早说清的人性地图；地图要变成你自己的风险预算、失效条件与复盘习惯，才算读进冷静投。下一步可直接打开《下单前三问清单》，把今天这套语言写成三行备注，再用一笔模拟单走通。",
    ],
    "zh-TW": [
      "行情放大人性：漲怕踏空、跌怕歸零，中間又想「再多一點」。貪婪、恐懼、欲望是決策推力，不是罵人標籤。《道德經》不教買賣點——讀它是為衝動找更冷的語言，不是玄學開單。本文非投資建議，不保證收益。",
      "一、欲望：「不見可欲」「五色令人目盲」。熱榜、截圖盈虧、群口號都是可欲。欲望有比較欲、敘事欲、活動欲——刷得越多越像努力，越接近心發狂。「持而盈之，不如其已」：滿了還倒，不如停止。對策是降刺激密度：盤中關熱榜，研究與下單時段分開。",
      "二、貪婪：「知足不辱，知止不殆」「金玉滿堂，莫之能守」。貪婪常偽裝成雄心。高發窗口：浮盈擴大、連續獲利、大虧後報復加倉。知足＝這筆完成條件可寫；知止＝失效可觸發。沒寫下來，盤中一定被改成「再等等」。",
      "三、恐懼：「寵辱若驚」。浮盈當勳章、浮虧當羞辱，計畫就被面子改寫。分清損失恐懼、後悔恐懼（踏空）、評價恐懼。怕虧可以；怕丟臉而改規則才致命。",
      "四、鏈條：欲望開想象 → 貪婪放大倉位 → 恐懼接管。拆環節：前端少刺激，中端定足夠與停止，後端給恐懼合法出口（失效／風險預算）。复盤畫箭頭，比寫「心態差」有用。",
      "五、啟發：無為是少妄為，不是躺平；能彎曲（認錯降倉）才易保全。上善若水＝倉位可退。為道日損＝減無用刷新與敘事。勿用「隨緣」為惰性辯護——知足知止是紀律。",
      "六、流程：開盤前寫清今日可否交易與「什麼都不做也算完成」；計畫寫完成條件＋風險預算＋失效預設動作；盤中三問，答不上不加倉；收盤記欲望從哪來、貪婪是否改規則、恐懼是否該停不停。站內用模擬、提醒、倉位工具練；AI 只助學，不當欲望燃料。",
      "七、誤區：知足≠永遠不做；知止≠死扛；別只羞辱修養不改流程；極端行情更要回風險預算。把語言寫成三行備註，再用模擬單走通——見《下單前三問清單》。經典給地圖，不保證收益。",
    ],
    en: [
      "Markets amplify three drives: desire, greed, and fear. They are not moral insults—they rewrite what you notice, whether you can stop, and whether you will void a plan. The Tao Te Ching predates exchanges yet names these drives early. Use it for colder language, not mystic entries. This essay is mindset and process—not advice, not a return promise.",
      "1) Desire — “Do not display what is desirable”; “the five colors blind the eye.” Hot lists, P&L screenshots, and chat slogans are engineered desirability. Faces of desire: comparison, narrative (“prove I’m smart”), and activity anxiety (“I must trade today”). More scrolling feels like work and often is “a mind gone wild.” “Better to stop than to keep filling what is already full.” Cut stimulus density: no hot-list grazing in the session; separate research time from order time.",
      "2) Greed — “Know contentment… know when to stop”; “jade and gold fill the hall—none can keep them.” Greed rarely says its name; it wears ambition. Peak windows: expanding open profit (invalidation slides), winning streaks (feel replaces budget), and post-loss revenge size (greed tied to fear). Contentment must be writable—what counts as done? Stopping must be triggerable—what voids the plan? Unwritten rules get rewritten as “wait a bit more.”",
      "3) Fear — “Favor and disgrace are alike startling.” Floating gains as medals, losses as shame. Types: loss pain, regret/FOMO, and evaluation fear (looking stupid). Fear that protects capital is caution; fear that protects face rewrites rules—the deadly kind.",
      "4) The chain — desire opens the story → greed sizes up or overstays → fear takes the wheel (freeze, revenge, or panic). Insulting “bad mindset” fails; break links: fewer stimuli up front, enough/stop in the middle, a legal exit for fear (invalidation, risk budget). Review by drawing the arrows on one trade.",
      "5) Insight — wu-wei is less forced striving, not fatalistic inactivity. Flexibility (admit error, cut size) preserves you. “Water” sizing: wrong and still sleep. “For the Way, daily decrease”: fewer useless refreshes and unverifiable narratives. Do not use “nature” to excuse skipped homework—contentment and stopping are discipline against impulses.",
      "6) Process — Before the open: allowed to trade today? Write “doing nothing also counts as success.” In the plan: completion condition + risk budget + default stop action. In session: structure → levels → invalidation; if you cannot answer, do not add risk. After: where did desire enter; did greed edit rules; did fear block a needed stop? Paper-trade stopping, bind alerts to plan levels, size a loss you can afford. AI chart help is study—not fuel.",
      "7) Misreads — contentment ≠ never act; stopping ≠ diamond-hand denial; classical shame without process change fails; extreme narratives demand budgets, not bigger size. Write three lines, run one paper trade (see the three-question checklist). Classics map human nature; they do not guarantee returns. Lasting participants install boundaries and brakes first.",
    ],
  },
};
