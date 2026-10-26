# PRD：复盘笔记（过程资产台）

| 项 | 内容 |
|---|---|
| 产品 | 钱力股 / Q-Stock |
| 路由 | `/review`（跨标的总览）；个股右栏「复盘」见 [symbol-trading-ui.md](./symbol-trading-ui.md) |
| 状态 | **已落地首版**（P0 + P1 核心） |
| 优先级 | P0 确定性过程台 → P1 规则对照与 AI 消费升级 → P2 候选规则与周报 |
| 相关 | [策略与回测](./strategy-and-backtest.md) · [风险控制](./risk-control.md) · [个股交易台 UI](./symbol-trading-ui.md) · [策略方向](../strategy-backtest-direction.md) · [路线图](../product-roadmap.md) |

---

## 1. 背景与目标

现状 `/review` 仅为「选今日/近一周 → 烧 AI 写笔记 → 右侧存 10 条」，首屏信息密度低，与产品主张「规则 → 模拟 → 对照偏差 → 修正规则」脱节。用户无 AI 配额或无成交时，页面几乎空白。

**目标**

把复盘页升级为跨标的**过程资产台**：先展示确定性事实与执行偏差，再可选 AI 过程解读，并提供回到规则/模拟的行动入口。

**成功标准**

- 有模拟成交的用户**不点 AI**也能看到区间摘要与成交列表。  
- 带策略标签的成交可链到规则；偏差用中性措辞，不把反事实盈亏差做主标题。  
- AI 只解释已算好的过程统计与成交事实；情绪只展示用户自选标签。  
- 空态能引导：计划绑定 → 模拟一笔 → 再回复盘。

**非目标**

- 收益排行、情绪诊断雷达、社区晒单。  
- 复盘页内完整策略编辑或量化 IDE（编辑在 `/strategies`）。  
- 系统自动改规则 / 自动下单；实盘券商复盘（富途同步另见其它 PRD）。

---

## 2. 用户与场景

| 角色 | 场景 |
|---|---|
| 周末复盘者 | 看近一周有多少笔带标签、哪些笔偏离计划 |
| 纪律学习者 | 对照「无标签 / 无失效价 / 自选情绪标记」改进下单习惯 |
| AI 用户 | 在看完事实后，用剩余配额生成过程解读并归档笔记 |
| 新用户 | 无成交时空态引导去模拟，而非只看到「开始复盘」 |

---

## 3. 与个股右栏的分工

| 表面 | 职责 |
|---|---|
| 个股右栏「复盘」 | 本标的近 N 笔；偏差芯片；对照规则 / 开新版本；链到 `/review` |
| `/review` | 跨标的时段总览、过程摘要、成交列表、历史笔记、AI 深度解读 |

两边**偏差口径一致**（同一套偏差判定函数）。

---

## 4. 范围分层

### 4.1 P0 — 确定性过程台（本版必达）

| 能力 | 说明 |
|---|---|
| **时段条** | 今日 / 近一周；与 AI 生成共用同一 `period` |
| **过程摘要** | 成交笔数、有策略标签数/占比、无标签数、带情绪标记笔数、开放持仓数、现金（若有） |
| **成交列表** | 时间 · 标的 · 方向 · 量价 · 策略标签 · 偏差芯片；可点进个股；`take` ≤ 40 |
| **筛选** | 全部 / 有标签 / 有标记（与个股右栏一致） |
| **空态** | 无成交 → 链 `/portfolio` 与行情；有成交无标签 → 轻提示补标签价值 |
| **历史笔记** | 保留最近 10 条；选中回看 AI 正文 |
| **AI 生成** | 仍走配额；生成前/旁可见确定性摘要，避免「只有按钮」 |

### 4.2 P1 — 规则闭环与 AI 升级（本版尽量落地）

| 能力 | 说明 |
|---|---|
| **策略筛选** | 按「有/无标签」或列表内标签可见即可；行内链 `/strategies/[id]` |
| **行动条** | 「修正规则」→ `/strategies`；「去模拟」→ `/portfolio` |
| **AI 输入** | Prompt 增加过程统计、策略名、emotionTags、invalidationNote、偏差计数；仍不荐股 |
| **清单勾选** | 笔记内 `nextChecklist` 可本地勾选（localStorage），形成轻量过程资产 |
| **脚注** | 标明标记来自自检与缺失字段，不是情绪诊断 |

### 4.3 P2 — 后置

| 能力 | 说明 |
|---|---|
| 与规则回放报告并列对照 | 同区间假设与样本边界；禁止反事实收益差做主 KPI |
| 候选规则草稿 | 从成交归纳「若…则…」，须用户确认 |
| 周末过程周报 | Worker 预计算 |
| 外部成交导入 | 后置；说明字段与保留期 |

### 4.4 Out of Scope

- 自定义任意日期区间（可后置）。  
- 组合盈亏曲线作为首屏主视觉。  
- 系统贴「贪婪/恐惧」诊断标签。

---

## 5. 信息架构

```text
┌─ 标题 + 副文案 ───────────────────────────────────────────────┐
├─ 时段：今日 | 近一周 │ 筛选：全部 | 有标签 | 有标记 ──────────┤
├─ A. 过程摘要（确定性，免 AI）─────────────────────────────────┤
│  成交 · 标签覆盖 · 标记笔数 · 持仓数 · 现金                    │
├─ B. 成交与偏差列表 ───────────────────────────────────────────┤
│  行：时间 · 标的 · 买/卖 · 量@价 · 标签 · 芯片                 │
├─ C. AI 过程解读（配额）───────────────────────────────────────┤
│  [开始复盘] → 摘要 / 做得好 / 待改进 / 情绪 / 下次清单         │
├─ D. 历史笔记（侧栏）+ 行动链 ─────────────────────────────────┤
└───────────────────────────────────────────────────────────────┘
```

---

## 6. 偏差口径（中性措辞）

与个股 `symbol-review-rail` 对齐：

| 芯片 | 判定 |
|---|---|
| 无规则标签 | `strategyId` 为空 |
| 未设失效价 | `invalidationNote` 为空 |
| 仓位过大标记 / 追涨 / 恐慌 / 报复单 / 无计划 | 用户提交时自选的 `emotionTags`（展示为「标记」，非系统诊断） |

**禁止**：把反事实「若按规则可多赚 X」做成列表主文案或大标题。

---

## 7. 数据与 API

### 7.1 `GET /api/review/process?period=day|week`

- 鉴权：登录用户。  
- **不消耗** AI 配额。  
- 返回：

```ts
{
  period: "day" | "week";
  since: string; // ISO
  summary: {
    fillCount: number;
    taggedCount: number;
    untaggedCount: number;
    taggedPct: number | null;
    emotionTaggedCount: number;
    openPositionCount: number;
    cash: number | null;
  };
  fills: Array<{
    id: string;
    symbol: string;
    assetType: string;
    side: "buy" | "sell";
    qty: number;
    filledPrice: number | null;
    filledAt: string | null;
    strategyId: string | null;
    strategyName: string | null;
    emotionTags: string[];
    invalidationNote: string | null;
    flags: string[]; // machine keys: noTag | noInvalidation | fomo | ...
  }>;
  positions: Array<{ symbol: string; assetType: string; qty: number; avgCost: number }>;
}
```

- 成交 `take: 40`，持仓 `take: 30`。

### 7.2 `GET/POST /api/ai/review`

- 保持笔记列表与生成；POST 的 `buildTradeReview` 须把过程统计与标签字段纳入 user payload。  
- 输出 schema 不变：`summary` / `whatWentWell` / `whatToImprove` / `emotionFlags` / `nextChecklist`。

### 7.3 共享库

- `src/lib/review/deviation.ts` — 偏差 flag 判定（个股右栏与复盘页共用或口径一致）。  
- `src/lib/review/process-summary.ts` — 组装摘要与 fills。

---

## 8. UI / 文案约束

- 沿用现有 `--aw-*` / `--brand` / `qt-panel`；一层边框，避免双卡空壳。  
- 副标题强调「过程」而非「盈亏」。  
- AI 区旁展示配额徽章；确定性区不标「AI」。  
- 免责：学习用途，不构成投资建议（沿用 `aiDisclaimer`）。  
- 单文件 &lt; 500 行：desk 编排 + 摘要 / 列表 / AI / 笔记 分文件。

---

## 9. 容量与小机

- 列表硬上限；禁止一次拉全历史成交进 Prompt。  
- 过程接口只读 Prisma，无外部行情风暴。  
- 笔记仍 `take: 10`。

---

## 10. 验收清单

### P0

- [x] 登录后不点 AI 可见过程摘要（有成交时数字 &gt; 0）  
- [x] 成交列表展示标的、方向、标签、偏差芯片  
- [x] 筛选：全部 / 有标签 / 有标记  
- [x] 无成交空态含去模拟或行情入口  
- [x] 历史笔记可选中回看  

### P1

- [x] 策略标签可链到规则页  
- [x] AI 生成消费标签与过程统计（服务端 payload 含字段）  
- [x] 清单可勾选（本地持久）  
- [x] 脚注说明非情绪诊断；行动链到策略实验室 / 模拟盘  

### 指标（产品评估，非优化目标）

- 区间内策略标签覆盖率  
- 不依赖 AI 即可完成「打开复盘并读完摘要」的比例  
- 清单回看/勾选率  

不以增加交易次数或 AI 点击率为优化目标。

---

## 11. 实现映射（首版）

| 模块 | 路径 |
|---|---|
| PRD | `docs/prd/review-notes.md` |
| 过程 API | `src/app/api/review/process/route.ts` |
| 汇总逻辑 | `src/lib/review/process-summary.ts` |
| 偏差 | `src/lib/review/deviation.ts` |
| AI 复盘 | `src/lib/ai/review.ts`（增强输入） |
| UI | `src/components/review/*` |
| Hook | `src/hooks/query/use-review-process.ts` |
