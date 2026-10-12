# PRD：定投计算器

| 项 | 内容 |
|---|---|
| 产品 | 钱力股 / Q-Stock · 理财工具 |
| slug | `dca` |
| 路由 | `/tools/dca` |
| 状态 | 待开发 |
| 优先级 | P0 |
| 相关 | [工具索引](./README.md) · [路线图切片 B](../product-roadmap.md) |

---

## 1. 背景与目标

定投是投教场景高频问题：「每月投多少、投多久、假设年化多少，大概会变成多少」。本工具用**固定假设收益率**做终值估算，帮助建立量级直觉，并明确标注「非回测、非承诺收益」。

**成功标准**

- 用户可切换「按期投入」与「已投本金 + 续投」两种简单模式（v1 至少支持经典定投）。  
- 结果同时展示：总投入、终值估算、收益估算、可选简易表格（前若干期或按年汇总）。  
- 不与真实标的历史净值绑定（历史回放属「定投实验室」后置项）。

---

## 2. 用户与场景

| 角色 | 场景 |
|---|---|
| 长线投资者 | 规划每月定投金额与年限 |
| 新手 | Learn「定投常识」文末打开本工具试算 |
| 对比型用户 | 改年化假设，看终值对收益率的敏感度 |

---

## 3. 范围

### 3.1 In Scope（v1）

- 每期投入金额、期数、定投频率（月 / 周 / 双周）、预期年化收益率（假设、固定）。  
- 复利方式：按期折算利率（见公式）。  
- 输出：总投入、终值、收益额、收益率；按年汇总表（若期数过多则只显示年度行）。  
- 示例填充、重置、免责声明、CTA。

### 3.2 Out of Scope（v1 不做）

- 按真实股票/基金历史 K 线回放（定投实验室）。  
- 通胀调整、税费、申购费分档。  
- 动态调仓、估值定投策略。  
- 账户级真实持仓同步。

---

## 4. 功能说明

### 4.1 输入字段

| 字段 | 类型 | 默认 / 约束 | 说明 |
|---|---|---|---|
| `contribution` | number &gt; 0 | 1000 | 每期投入 |
| `frequency` | enum | `monthly` | `weekly` \| `biweekly` \| `monthly` |
| `periods` | int ≥ 1 | 120（月频约 10 年） | 总期数；上限建议 600（防 UI 卡顿） |
| `annualRatePercent` | number | 6 | 允许 -50～50；可为负（示意亏损假设） |
| `initialPrincipal` | number ≥ 0 | 0 | 开始前已有本金（可选，默认 0） |

### 4.2 频率 → 年期数

```text
nPerYear =
  weekly   → 52
  biweekly → 26
  monthly  → 12

r = annualRatePercent / 100
i = (1 + r)^(1 / nPerYear) - 1    // 期利率；r ≤ -1 时拒绝
```

### 4.3 终值公式（期末投入约定）

采用**每期末投入**的普通年金 + 期初本金复利：

```text
FV_initial = initialPrincipal * (1 + i)^periods

FV_annuity = contribution * [ ((1 + i)^periods - 1) / i ]   // i === 0 时 = contribution * periods

FV = FV_initial + FV_annuity
totalContributed = initialPrincipal + contribution * periods
profit = FV - totalContributed
profitPct = totalContributed > 0 ? profit / totalContributed * 100 : 0
```

当 `i === 0`（年化为 0）：年金终值 = `contribution * periods`。

### 4.4 按年汇总（展示用）

- 按 `nPerYear` 把期数切成「年」；最后一年可能不足。  
- 每年行：年末累计投入、年末估算市值（用到该期末的 FV 公式切片）。  
- 期数 &gt; 60 时默认只展示年度表，不逐期展开（可提供「展开前 12 期」折叠）。

### 4.5 输出展示

- 终值（大字）、总投入、估算收益 / 收益率  
- 小型说明：「按固定年化假设折算，实际波动会导致路径与结果不同」  
- 敏感度（可选 v1）：同一表单旁展示年化 ±2% 的终值对照（三个数字即可）

---

## 5. 信息架构与 UI

- 索引卡：标题「定投」、副文「按假设年化估算坚持投入的终值」。  
- 详情：表单 + 结果 KPI + 年度表。  
- CTA：去行情；去 Learn（若定投文章已上线）。

---

## 6. 文案要点（zh-CN 草案）

- 标题：定投计算器  
- 副标题：用固定假设，感受时间与收益率的量级  
- 免责：非历史回测，不代表任何产品收益，不构成投资建议。

---

## 7. 验收标准

- [ ] `/tools/dca` 可打开并计算  
- [ ] 用例：每月 1000、120 期、年化 6%、期初 0 → 与公式实现一致（实现时锁定期望值写入单测，允许浮点误差 &lt; 0.01）  
- [ ] 年化 0%：终值 = 总投入  
- [ ] periods 超上限有提示并截断或拒绝  
- [ ] 负年化可算且收益可为负  
- [ ] 免责声明可见；无「保证收益」措辞  
- [ ] 纯函数可单测：`src/lib/tools/dca.ts`

---

## 8. 埋点（可选）

- `tools_dca_calculate`  
- `tools_dca_cta_markets`

---

## 9. 实现提示

- `src/lib/tools/dca.ts`  
- `src/components/tools/dca-calculator.tsx`  
- `src/app/[locale]/tools/dca/page.tsx`  
- i18n：`tools.dca.*`  
- 后置：`定投实验室`（历史 K 线）另开 PRD，不在本文件范围。
