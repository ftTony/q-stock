# PRD：复利计算器

| 项 | 内容 |
|---|---|
| 产品 | 钱力股 / Q-Stock · 理财工具 |
| slug | `compound` |
| 路由 | `/tools/compound` |
| 状态 | 待开发 |
| 优先级 | P0 |
| 相关 | [工具索引](./README.md) · [路线图切片 B](../product-roadmap.md) |

---

## 1. 背景与目标

复利是投教基础概念。本工具支持「本金 + 定期追加 + 年化假设 + 复利频率」估算终值，并可用图表/表格展示增长曲线，帮助理解**时间与频率**的影响。与定投工具的区别：复利工具更强调本金滚动与计息频率；定投工具更强调「每期定额投入」的年金叙事（二者公式可复用部分，但产品入口与文案分开）。

**成功标准**

- 支持年 / 半年 / 季 / 月复利频率。  
- 可选每期追加（与定投部分重叠时可在 UI 注明「更完整追加场景请用定投工具」或共享底层库）。  
- 结果可截图分享量级，无收益承诺。

---

## 2. 用户与场景

| 角色 | 场景 |
|---|---|
| 理财新手 | 「10 万放着，年化 5%，20 年呢」 |
| 对比用户 | 改复利频率，看年结 vs 月结差异 |
| 内容运营 | 文章内嵌或外链到本页做互动 |

---

## 3. 范围

### 3.1 In Scope（v1）

- 期初本金、年化收益率、投资年数、复利频率。  
- 可选：每年（或每复利期）固定追加金额。  
- 输出：终值、总投入、收益；按年增长表；简易折线（可用纯 CSS/SVG 或现有图表库，避免为工具单独引入重依赖）。  
- 示例、重置、免责、CTA。

### 3.2 Out of Scope（v1 不做）

- 连续复利极限演示以外的高等数学专题（可文案一句带过）。  
- 通缩/通胀双曲线（可 v1.1：实际购买力开关）。  
- 税负、费率档位。  
- 与银行产品 APY 自动对齐。

---

## 4. 功能说明

### 4.1 输入字段

| 字段 | 类型 | 默认 / 约束 | 说明 |
|---|---|---|---|
| `principal` | number ≥ 0 | 100000 | 期初本金 |
| `annualRatePercent` | number | 5 | -50～50 |
| `years` | number &gt; 0 | 10 | 允许一位小数；上限 50 |
| `compoundFrequency` | enum | `annual` | `annual` \| `semiannual` \| `quarterly` \| `monthly` |
| `contribution` | number ≥ 0 | 0 | 每个计息期末追加（可选） |
| `contributionTiming` | enum | `end` | v1 固定期末；文案写明 |

### 4.2 计算公式

```text
nPerYear =
  annual → 1, semiannual → 2, quarterly → 4, monthly → 12

r = annualRatePercent / 100
i = r / nPerYear                 // 名义年率按期分割（教学常用；文案注明）
N = round(years * nPerYear)      // 或 floor；实现选定一种并单测锁死

FV_principal = principal * (1 + i)^N

FV_contrib =
  contribution === 0 ? 0
  : i === 0 ? contribution * N
  : contribution * ( ((1 + i)^N - 1) / i )

FV = FV_principal + FV_contrib
totalContributed = principal + contribution * N
profit = FV - totalContributed
```

**说明（写进 UI 帮助）**：此处采用「年名义利率 / 期数」的常见教学拆法，与定投工具「有效利率按期折算」略有不同；两工具并排时勿混称「同一公式」。若实现层希望统一，可抽 `src/lib/tools/time-value.ts`，但 UI 文案仍按工具定位区分。

### 4.3 输出展示

- 终值大字、总投入、收益、收益倍数（FV / totalContributed）  
- 按年快照表（每年末 FV）  
- 可选：同本金下「仅单利」对照条（`principal + principal*r*years + 追加粗算`），强化复利直觉（v1 建议做，一句对比即可）

### 4.4 交互

- 即时重算；非法输入阻断。  
- 示例：「10 万 · 5% · 10 年 · 年复利 · 无追加」。  
- CTA：去定投工具对比、去行情、去模拟。

---

## 5. 信息架构与 UI

- 索引卡：标题「复利」、副文「本金、时间与计息频率如何放大结果」。  
- 详情：表单 + KPI + 年表示意曲线。  
- 与定投页互链，避免用户困惑重复。

---

## 6. 文案要点（zh-CN 草案）

- 标题：复利计算器  
- 副标题：看清时间与频率，而不是寻找「稳赚」数字  
- 免责：假设收益率固定，现实中有波动与本金损失可能；不构成投资建议。

---

## 7. 验收标准

- [ ] `/tools/compound` 可用  
- [ ] 用例：本金 100000、年化 5%、10 年、年复利、无追加 → FV = 100000 * (1.05)^10（单测锁定期望，误差 &lt; 0.01）  
- [ ] 月复利与年复利结果不同且月 ≥ 年（正利率时）  
- [ ] 追加 &gt; 0 时总投入含追加  
- [ ] 免责声明；无「稳赚」「保本」措辞  
- [ ] 纯函数：`src/lib/tools/compound.ts` + 单测

---

## 8. 埋点（可选）

- `tools_compound_calculate`  
- `tools_compound_cta_dca`（跳转定投）

---

## 9. 实现提示

- `src/lib/tools/compound.ts`（可与 dca 共享小数工具函数）  
- `src/components/tools/compound-calculator.tsx`  
- `src/app/[locale]/tools/compound/page.tsx`  
- i18n：`tools.compound.*`
