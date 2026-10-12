# PRD：仓位风险计算器

| 项 | 内容 |
|---|---|
| 产品 | 钱力股 / Q-Stock · 理财工具 |
| slug | `position` |
| 路由 | `/tools/position` |
| 状态 | 待开发（Coming soon → 首批上线） |
| 优先级 | P0 |
| 相关 | [工具索引](./README.md) · [路线图切片 B](../product-roadmap.md) |

---

## 1. 背景与目标

个人投资者常凭感觉下单，仓位与止损脱节。本工具用**账户权益、单笔风险比例、入场价与止损价**反推建议股数/名义金额，强化「先定风险再定仓位」的流程，并与模拟盘 CTA 衔接。

**成功标准**

- 用户 30 秒内填完表并得到可读结果（股数、名义仓位、风险金额）。  
- 不出现推荐买卖方向的文案。  
- 与定投 / 复利 / 期权工具共用同一 Tools 壳与免责声明组件。

---

## 2. 用户与场景

| 角色 | 场景 |
|---|---|
| 自学交易者 | 准备在模拟盘下一笔前，先算「亏到止损最多亏多少钱」 |
| 定投型用户 | 偶尔做波段，想限制单票风险不超过账户 1%–2% |
| 投教学员 | Learn 文「仓位与止损」文末跳进本工具练习 |

**非目标用户**：机构 OMS 风控（见机构规则引擎另案）；不需要本工具做多账户权限。

---

## 3. 范围

### 3.1 In Scope（v1）

- 输入：账户权益、单笔风险 %（或固定风险金额二选一）、入场价、止损价、方向（多 / 空，默认多）、可选「每股/每合约乘数」（默认 1，美股股票为 1）。  
- 输出：风险金额、每股（或每单位）风险、建议数量（向下取整）、名义仓位、占权益比例、简单文字说明。  
- 校验：止损相对入场价方向正确（多：止损 &lt; 入场；空：止损 &gt; 入场）；风险 % 在合理区间。  
- 示例一键填充；重置；复制结果摘要（可选 v1.1）。  
- 免责声明 + CTA 去模拟盘 / 行情。

### 3.2 Out of Scope（v1 不做）

- 自动拉实时报价填入入场价（可 v1.1：从 URL `?symbol=` 预填符号名，价仍手填）。  
- 保证金 / 杠杆 / 融资利率。  
- 期权希腊值仓位（归期权工具）。  
- 保存历史到账户、分享短链（可后置）。

---

## 4. 功能说明

### 4.1 输入字段

| 字段 | 类型 | 默认 / 约束 | 说明 |
|---|---|---|---|
| `equity` | number &gt; 0 | 示例 100000 | 账户权益（任意货币单位，界面标注「单位自洽即可」） |
| `riskMode` | enum | `percent` | `percent` \| `amount` |
| `riskPercent` | number | 1 | 0.1–10；仅 percent 模式 |
| `riskAmount` | number | — | &gt; 0 且 ≤ equity；仅 amount 模式 |
| `entry` | number &gt; 0 | 示例 100 | 入场价 |
| `stop` | number &gt; 0 | 示例 95 | 止损价 |
| `side` | enum | `long` | `long` \| `short` |
| `multiplier` | number ≥ 1 | 1 | 合约乘数；股票保持 1 |

### 4.2 计算公式

```text
riskBudget =
  riskMode === percent ? equity * (riskPercent / 100) : riskAmount

perUnitRisk = |entry - stop| * multiplier

qty = floor(riskBudget / perUnitRisk)   // perUnitRisk === 0 → 错误

notional = qty * entry * multiplier
riskUsed = qty * perUnitRisk
riskPctOfEquity = riskUsed / equity * 100
positionPctOfEquity = notional / equity * 100
```

空头：`perUnitRisk` 同为绝对值差；说明文案改为「若价格上涨至止损」。

### 4.3 输出展示

- 建议数量（大字）  
- 风险金额 / 占权益 %  
- 名义仓位 / 占权益 %  
- 每股（单位）风险  
- 若 `qty === 0`：提示「风险预算过小或止损过宽，请调整」  
- 不展示「预期收益」或盈亏比（盈亏比可作 v1.1：增加目标价字段）

### 4.4 交互

- 任意有效输入变更即重算（客户端）。  
- 非法组合：表单下红字，结果区灰显。  
- 「填入示例」「清空」。  
- CTA：`去模拟盘练习` → `/portfolio`；`去行情看看` → `/markets`。

---

## 5. 信息架构与 UI

- Tools 索引卡：标题「仓位风险」、副文「按止损反推可开仓数量」。  
- 详情页：左表单 / 右结果（移动端上下堆叠）。  
- 视觉：跟现有营销壳或产品壳统一（实现时与 Learn/Tools 壳决策一致）；**不用卡片堆叠装饰**，表单即交互容器。  
- 必须有免责声明条。

---

## 6. 文案要点（zh-CN 草案）

- 标题：仓位风险  
- 副标题：先定能亏多少，再算能买多少  
- 免责：结果仅为假设估算，未计入滑点、佣金与缺口，不构成投资建议。

---

## 7. 验收标准

- [ ] `/tools` 卡片可进入 `/tools/position`  
- [ ] 示例数据下：权益 100000、风险 1%、多、入场 100、止损 95 → qty = 200，风险金额 = 1000  
- [ ] 多单止损 ≥ 入场时无法出结果并提示  
- [ ] 空单止损 ≤ 入场时无法出结果并提示  
- [ ] `perUnitRisk = 0` 有明确错误  
- [ ] 免责声明与 CTA 可见  
- [ ] 无「建议买入/卖出 XXX」类文案  
- [ ] `src/lib/tools/position.ts` 有可单测的纯函数；关键用例有单元测试（至少上述示例）

---

## 8. 埋点（可选）

- `tools_position_calculate`（成功算出 qty&gt;0）  
- `tools_position_cta_portfolio` / `tools_position_cta_markets`

---

## 9. 实现提示

- `src/lib/tools/position.ts` — 纯计算  
- `src/components/tools/position-calculator.tsx` — UI  
- `src/app/[locale]/tools/position/page.tsx` — 页面  
- i18n：`messages/*.json` → `tools.position.*`
