# 理财工具 PRD 索引

对应产品路由：`/tools`（索引）与 `/tools/[slug]`（各计算器）。  
实现优先级与验收总表见 [可落地路线图 · 切片 B](../product-roadmap.md)。

| 工具 | slug | PRD | 优先级 |
|---|---|---|---|
| 仓位风险 | `position` | [tool-position-sizing.md](./tool-position-sizing.md) | P0 |
| 定投 | `dca` | [tool-dca.md](./tool-dca.md) | P0 |
| 复利 | `compound` | [tool-compound.md](./tool-compound.md) | P0 |
| 期权估算 | `options` | [tool-options.md](./tool-options.md) | P0（与上三者同批上线） |

**共同约束**

- 纯前端计算即可（无需登录、无需行情 API）；可选「填入示例」按钮。  
- 结果为**假设估算**，页脚固定免责声明 + 链到 `/disclaimer`。  
- 结果区 CTA：去 `/portfolio`（模拟）或 `/markets`（行情）。  
- 不输出「应买入/应卖出」结论；不做实盘下单。  
- 单文件遵守仓库 500 行上限：逻辑放 `src/lib/tools/*`，UI 放 `src/components/tools/*`。

---

## 相关（非纯计算器）

| 主题 | PRD | 说明 |
|---|---|---|
| 专业交易员能力边界 | [trader-capability-boundary.md](./trader-capability-boundary.md) | 波段/学习型：我们做 / 以后做 / 不做；需求砍伐与评审口径 |
| 机构侧能力边界 | [institution-capability-boundary.md](./institution-capability-boundary.md) | 投教/白标/非 OMS：机构需求全景与裁剪；与 C 端分 SKU |
| C 端付费闭环 | [c-end-billing.md](./c-end-billing.md) | Free/Pro/BYOK 权益、兑换码、Stripe、研究卡试用；与源码售卖分栏 |
| 模拟盘风险控制 | [risk-control.md](./risk-control.md) | 下单前摘要、账户规则、与仓位工具/AI 衔接；作用于 paper，非真券商 OMS |
| 交易策略与回测 | [strategy-and-backtest.md](./strategy-and-backtest.md) | 规则实验室：模板、单标的回放、模拟标签；非量化 IDE / 非实盘自动交易 |
| 复盘笔记 | [review-notes.md](./review-notes.md) | 跨标的过程资产台：确定性摘要 + 偏差列表 + 可选 AI 解读 |
| 个股图表形态 | [symbol-chart-types.md](./symbol-chart-types.md) | 蜡烛 / 面积独立切换；P0 已落地 |
| 多图对比 | [multi-chart-compare.md](./multi-chart-compare.md) | 多标的 1/2/4 格同屏；`/multi-chart`；分析篮带入 |
