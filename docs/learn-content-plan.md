# 投资知识专栏 — 内容规划

> 对应产品：`/learn`（列表）· `/learn/[slug]`（短文）  
> 品牌口径：冷静投、学习参考、不荐股、不承诺收益  
> 文稿：Postgres `LearnArticle` + 磁盘快照 `data/learn`（种子仍在 `src/lib/learn/articles-*.ts`；日更用 `npm run learn:import`）  
> 上线步骤见 [可落地路线图 · 切片 A](./product-roadmap.md)；理财工具见 [PRD 索引](./prd/README.md)

---

## 1. 专栏定位

| 项 | 说明 |
|---|---|
| 一句话 | 短文教会「怎么看、怎么用站内工具、怎么管情绪」，不是荐股号 |
| 读者 | 个人投资者 / 学员；美股·港股·A 股·加密多市场入门到进阶 |
| 体裁 | 约 1200–2200 字（简中可稍长）；误区开篇 → 框架/作用 → 编号步骤 → 站内练习 → 边界；可配 CTA |
| 语气 | 克制、可核对、强调失效条件与流程；禁止喊单与收益承诺 |
| 与 Tools 分工 | Learn 讲「为什么 / 怎么想」；Tools 给「算出来」；二者互相深链 |
| 与书单分工 | 短文管「站内怎么做」；[推荐书单与路线](./learn-reading-list.md) 管「课外怎么读」 |

**成功标准（内容侧）**

- 首发至少 **6** 篇可打开短文（含现有 3 篇润色），覆盖三类目。  
- 每篇至少 1 个产品内链（行情 / 分析 / 模拟 / 复盘 / 工具）。  
- 无个股买卖结论；涉及标的仅作「如何查看」示例，不写目标价。  
- 书单模块：至少有 **书单总览 + 学习路线** 各 1 页，以及若干单书导读（详见书单文档验收）。

---

## 2. 类目结构（沿用代码枚举）

现有 `category`：`basics` | `tools` | `mindset`。规划上扩展语义，**不必改枚举**也可先塞文；若后续要加「市场入门」等，再增 `markets` 并改 i18n。

| 类目 key | 中文栏名（建议） | 写什么 | 不写什么 |
|---|---|---|---|
| `basics` | 基础 | 市场规则、K 线/指标常识、模拟与复盘流程、风险与杠杆概念 | 荐股、内幕、保证收益 |
| `tools` | 工具 | 站内功能怎么用；仓位/定投/复利/期权计算器背后的逻辑 | 把工具结果说成「该买」 |
| `mindset` | 心态 | 冷静看盘、清单、情绪、失效条件 | 鸡汤励志空转、仇视某类投资者 |

可选后续类目（改代码时再开）：

| 类目 | 用途 |
|---|---|
| `markets` | 美 / 港 / A / 加密各自交易时段、代码习惯、合规提示 |
| `glossary` | 词条级（PE、IV、DCA…）超短页，利于 SEO |
| `reading` | 书单总览、学习路线、单书导读（也可暂归 `mindset` / `basics`） |

---

## 3. 内容原则（编辑红线）

1. **结构优先**：尽量按「是什么 → 为何重要 → 怎么在钱力股练习 → 失效/边界」写。  
2. **可行动但不下单**：行动是「加自选、设提醒、跑模拟、打开计算器」，不是「买入 XXX」。  
3. **数据谦逊**：提到估值/财报时，提醒免费源可能有估算与延迟（与同业对比文一致）。  
4. **多市场一句提示**：写美股期权、A 股 T+1、加密 7×24 等差异时，点到为止并链免责声明。  
5. **语言**：首发以 `zh-CN` + `en` 为准；`zh-TW` 尽量同步；其它语种可先回退 en。  
6. **更新**：规则/产品变更时改文，不追求日更资讯流（资讯在个股 News，不进 Learn）。

---

## 4. 已有文稿（P0 保留上线）

| slug | 类目 | 标题（zh-CN） | 建议 CTA |
|---|---|---|---|
| `calm-watching` | mindset | 冷静看盘：先看结构，再谈感觉 | 个股 AI 读图 / 情景；提醒 |
| `peer-compare` | tools | 同业对比怎么用 | `/analysis` |
| `paper-review` | basics | 模拟交易与复盘笔记 | `/portfolio` · `/review` |

上线前小改：文末统一组件「想动手试试？」+ 免链接；核对免责声明一句。

---

## 5. 选题目录（可产出清单）

优先级：P0 首发 → P1 首月补齐 → P2 季度池。  
`status`：`drafted` = 已在 `articles.ts`；`planned` = 待写。

### 5.1 基础 basics

| slug | 标题（草案） | 要点 | CTA | 优先级 | 状态 |
|---|---|---|---|---|---|
| `paper-review` | 模拟交易与复盘笔记 | 流程 > 虚荣收益；每周复盘三问 | 模拟 / 复盘 | P0 | drafted |
| `kline-basics` | K 线怎么读：影线、实体与别过度解读 | OHLC、常见误读；指标不预测未来 | 个股 K 线页 | P0 | drafted |
| `indicators-lite` | MA / MACD / RSI：辅助而非圣杯 | 各一句话用途 + 失效时看什么 | 个股指标 | P0 | planned |
| `multi-market-101` | 一个终端里的美股、港股、A 股与加密 | 时段、代码习惯、合规「先问能不能」 | `/markets` | P0 | drafted |
| `risk-before-size` | 风险预算：先定亏得起，再谈仓位 | 与仓位工具同一套语言 | `/tools/position` | P1 | planned |
| `orders-and-slippage` | 限价、市价与滑点（学习向） | 模拟盘里如何体会；真盘以券商为准 | 模拟下单 | P1 | planned |
| `earnings-season` | 财报季看什么、不看什么 | 日历/摘要是线索；警惕预期差情绪 | 个股 earnings Tab | P1 | planned |
| `leverage-warning` | 杠杆与爆仓直觉（含加密） | 放大收益也放大归零；本站不做真杠杆下单 | 免责声明 | P2 | planned |

### 5.2 工具 tools

| slug | 标题（草案） | 要点 | CTA | 优先级 | 状态 |
|---|---|---|---|---|---|
| `peer-compare` | 同业对比怎么用 | 同赛道 2–4 只；估算值口径 | `/analysis` | P0 | drafted |
| `watchlist-alerts` | 自选与价格提醒：少而准 | 提醒写失效位，不是许愿位 | `/watchlist` · `/alerts` | P0 | drafted |
| `ai-chart-read` | AI 读图与对话：怎么提问更有用 | 要结构/价位/失效；交叉验证 | 个股 AI Tab | P0 | drafted |
| `scenario-map` | 情景地图：涨、跌、震荡各准备什么 | 与纸面条件单草案衔接 | 情景 / 模拟 | P1 | planned |
| `position-tool-guide` | 仓位计算器怎么用 | 对应 [仓位 PRD](./prd/tool-position-sizing.md) | `/tools/position` | P1 | planned |
| `dca-tool-guide` | 定投计算器：假设不是承诺 | 对应 [定投 PRD](./prd/tool-dca.md) | `/tools/dca` | P1 | planned |
| `compound-tool-guide` | 复利计算器：时间与频率 | 对应 [复利 PRD](./prd/tool-compound.md) | `/tools/compound` | P1 | planned |
| `options-tool-guide` | 期权估算：先看打和与最大亏损 | 对应 [期权 PRD](./prd/tool-options.md)；教学非下单 | `/tools/options` | P1 | planned |
| `byok-keys` | 为什么支持自带行情 / AI Key | 隐私与配额；平台 Key 优先逻辑一句话 | `/settings` | P2 | planned |

### 5.3 心态 mindset

| slug | 标题（草案） | 要点 | CTA | 优先级 | 状态 |
|---|---|---|---|---|---|
| `calm-watching` | 冷静看盘：先看结构，再谈感觉 | 结构 → 价位 → 失效 | AI / 提醒 | P0 | drafted |
| `checklist-three` | 下单前三问清单 | 结构？风险预算？失效写了没？ | 模拟 / 仓位工具 | P0 | drafted |
| `fomo-and-news` | 热点与 FOMO：新闻怎么用 | 新闻是上下文，不是扳机 | 个股新闻 Tab | P1 | planned |
| `review-emotions` | 复盘里的情绪标签 | 冲动、报复单、计划外；改流程不改「报复市场」 | `/review` | P1 | planned |
| `less-is-more` | 少交易、多等待 | 与模拟「少而认真」呼应 | 复盘 | P2 | planned |
| `invalidation-habit` | 把失效条件写成习惯 | 提醒 + 笔记模板 | 提醒 | P2 | planned |

### 5.4 词条 / SEO 短页（P2 池，可后置格式）

不必长文，可 300–500 字 + 链到长文或工具：

| slug | 词条 |
|---|---|
| `term-pe-pb` | PE / PB |
| `term-dca` | 定投 |
| `term-iv` | 隐含波动率（配合期权工具） |
| `term-stop-loss` | 止损 |
| `term-paper-trading` | 模拟交易 |

### 5.5 书单与学习路线 reading

完整书目、每本书「讲了什么 / 启发 / 站内练习」、路线 A/B/C 见专文：

**→ [learn-reading-list.md](./learn-reading-list.md)**

| slug | 标题（草案） | 要点 | 优先级 | 状态 |
|---|---|---|---|---|
| `reading-list` | 冷静投书单：先读什么、别读什么 | 分阶 12 本核心书；边界说明 | P0 | planned |
| `learning-path` | 三条学习路线：启蒙 → 长期 → 进阶 | 书 + 短文 + 站内动作 | P0 | planned |
| `book-psychology-of-money` 等 | 单书导读 | 见书单文档 §4 全表 | P1–P2 | planned |

---

## 6. 首发包（建议一次上线）

共 **8** 篇（3 drafted + 5 planned），保证三类目都有货，并覆盖主闭环与 Tools 预告：

| # | slug | 类目 |
|---|---|---|
| 1 | `calm-watching` | mindset |
| 2 | `checklist-three` | mindset |
| 3 | `paper-review` | basics |
| 4 | `kline-basics` | basics |
| 5 | `multi-market-101` | basics |
| 6 | `peer-compare` | tools |
| 7 | `watchlist-alerts` | tools |
| 8 | `ai-chart-read` | tools |

Tools 计算器专文（`*-tool-guide`）可与 [切片 B](./product-roadmap.md) 同步发布，避免链到 coming-soon。

**紧随首发的书单包（建议 +1 周）**：`reading-list` + `learning-path` + 至少 2 篇导读（优先《金钱心理学》《漫步华尔街》或《思考，快与慢》）。

---

## 7. 单篇内容模板（写作 / 入库）

```text
标题
摘要（1 句，列表卡用；点出误区或边界）
正文（简中宜充实，勿只剩提纲）：
  1. 开篇：读者误区 / 为何这篇值得读
  2. 核心观点（一句钉死）
  3. 编号步骤或作用（一、二、三… 便于步骤卡）
  4. 常见踩坑 / 失效条件
  5. 在钱力股如何练习（点名功能，少堆外链）
  6. 收束：概率、非圣杯、与冷静投框架对齐
文末 CTA（产品组件，不必写入 paragraphs）
免责：仅供学习，不构成投资建议
语种：发布必填 zh-CN + en；zh-TW 可选
步骤卡：正文用「一、」或「1)」开头，前端自动成卡片
```

入库字段：`slug` / `category` / `ctaHref?` / `status` / 各语种 `title`·`summary`·`paragraphs[]`。  
导入：`npm run learn:seed`（灌现有 TS）或 `npm run learn:import -- batch.json`；API `POST /api/admin/learn/articles`（`Bearer LEARN_IMPORT_SECRET`）。  
Web 读 `LEARN_DATA_DIR` 快照，不在请求路径扫全文库。站内 CMS 后置。

---

## 8. 与产品路径的映射

```text
看盘入门     → multi-market-101, kline-basics, calm-watching
                   ↓
自选与提醒   → watchlist-alerts, invalidation-habit
                   ↓
分析与 AI    → peer-compare, ai-chart-read, scenario-map
                   ↓
算风险/理财  → risk-before-size + 四个 *-tool-guide
                   ↓
模拟与复盘   → paper-review, review-emotions, checklist-three
                   ↓
课外阅读     → reading-list / learning-path / book-*（见书单文档）
```

**与书单三路线对齐（摘要）**

| 路线 | 主题 | 代表书 | 站内终点 |
|---|---|---|---|
| A 启蒙 | 金钱观、偏见 | 《金钱心理学》《思考快与慢》 | 复利/定投 + 三问 + 少笔模拟 |
| B 长期 | 谦逊、纪律、多市场 | 《漫步华尔街》、指数/定投类 | 对比 + 提醒 + 仓位规则 |
| C 进阶 | 安全边际、周期、风险语言 | 《聪明的投资者》、Marks、Taleb | 情景/复盘/期权最大亏损 |

列表页可用「学习路径」分组（UI 后置）；数据层仍按 category 过滤即可。详表见 [learn-reading-list.md §3](./learn-reading-list.md)。

---

## 9. 明确不产出的内容

| 类型 | 原因 |
|---|---|
| 每日涨停/土豪荐股 | 与品牌与合规冲突 |
| 承诺收益、跟单信号 | 法律与信任风险 |
| 未证实传闻、内幕暗示 | 合规 |
| 长篇研报替代品 | 非定位；个股页已有新闻/财报入口 |
| 无产品挂钩的纯鸡汤 | 难转化、难维护 |
| 实时快讯流 | 与 News 重复；Learn 保持常青 |
| 暴富秘籍 / 跟单书当圣经 | 与冷静投冲突；书单见「别读什么」 |
| 把《股票作手回忆录》写成操作手册 | 易误导；导读须标反面教材属性 |

---

## 10. 产能与节奏建议

| 阶段 | 产出 | 说明 |
|---|---|---|
| 切片 A 当周 | 首发包 8 篇可打开 | 5 篇新写须 zh-CN+en |
| 切片 A +1 周 | 书单总览 + 学习路线 + 2 篇导读 | 见 [learn-reading-list.md](./learn-reading-list.md) |
| Tools 上线周 | 4 篇 tool-guide | 与计算器同发 |
| **日常** | **约 10 篇/天**（中英成稿） | JSON 批次 `learn:import`；不必发版 |
| 季度 | 抽检过时文案 + 词条 SEO + 书单加减 | 改产品名/路由时必改文 |

批次示例：`data/batches/2026-10-14.json` 为 `{ "articles": [ … ] }` 或纯数组；每篇含双语字段后导入即刷新快照。

---

## 11. 验收清单（内容 + 工程）

- [ ] `/learn` 非 coming-soon；卡片显示标题、摘要、类目  
- [ ] `/learn/[slug]` 取消强制 redirect；首发包 8 篇可打开  
- [ ] 每篇有 CTA；页脚免责与 `/disclaimer` 一致  
- [ ] sitemap 含 learn URL  
- [ ] 无荐股/目标价/保证收益措辞（抽检）  
- [ ] 链到尚未上线的 Tools 时：要么不上该 CTA，要么 Tools 已发布  
- [ ] 书单：总览 + 路线页可打开；导读含「讲了什么 / 启发 / 站内练习」；无暴富承诺  
- [ ] `learn:seed` / `learn:import` 后快照存在；缺 en 不能 published；sitemap 含新 slug  

---

## 12. 相关文档

- [推荐理财书籍与学习路线](./learn-reading-list.md)  
- [产品现状](./product-status.md)  
- [产品机会头脑风暴](./product-opportunity-brainstorm.md)  
- [可落地路线图](./product-roadmap.md)  
- [理财工具 PRD](./prd/README.md)  
