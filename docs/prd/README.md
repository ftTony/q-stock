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
| 模拟盘风险控制 | [risk-control.md](./risk-control.md) | 下单前摘要、账户规则、与仓位工具/AI 衔接；作用于 paper，非真券商 OMS |
| 交易策略与回测 | [strategy-and-backtest.md](./strategy-and-backtest.md) | 规则实验室：模板、单标的回放、模拟标签；非量化 IDE / 非实盘自动交易 |
