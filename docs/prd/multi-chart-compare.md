# PRD：多图对比（多标的同屏）

| 项 | 内容 |
|---|---|
| 产品 | 钱力股 / Q-Stock |
| 路由 | `/multi-chart` |
| 状态 | **P0 实现** |
| 优先级 | 分析对照增强；侧栏不增项（归「分析」高亮） |
| 相关 | [trader-capability-boundary](./trader-capability-boundary.md) · [site-navigation](./site-navigation.md) · [analysis 对比篮](../product-status.md) · [symbol-chart-types](./symbol-chart-types.md) |

---

## 1. 背景与目标

分析页已有基本面对比篮；个股页单图能力完整。缺口是**多标的 K 线同屏**，便于波段对照节奏是否同步（谁先走、谁背离），服务 **看盘 → 分析**，不是彭博式马赛克工作站。

**成功标准**

- 桌面可选 1 / 2 / 4 格；每格独立标的；**全局共享周期**。  
- 分析对比篮 ≥2 只可一键带入 `/multi-chart`（URL `legs` 可分享）。  
- 最多 4 路行情请求；复用现有 `/api/candles` 与 bar 上限（小机友好）。

---

## 2. 信息架构

```text
┌─ ← 分析对比 · 标题 · legs 摘要 · 1|2|4 · 周期 · MA/MACD ─┐
│  脚注：区间未同步提示                                       │
├──────────────┬──────────────────────────────────────────┤
│ Pane 头：代码 │ 更换 / 个股 / 清除（可内联搜索换标）         │
│ CandleChart  │ 无画线条；默认仅 MA；顶栏统一开关指标         │
├──────────────┼──────────────────────────────────────────┤
│ …最多四格…                                                  │
└──────────────────────────────────────────────────────────┘
```

- **入口**：`/multi-chart`；分析对比面板 CTA「多图对比」。  
- **返回**：顶栏链回 `/analysis`（保持分析高亮）。  
- **侧栏**：不新增图标；`/multi-chart` 与 `/symbol` 同归「分析」选中态。  
- **H5**：优先 1～2 格纵向；4 格以桌面为主。

### URL / 持久化

| 键 | 含义 |
|---|---|
| `layout` | `1` \| `2` \| `4` |
| `resolution` | 与个股一致的 `CandleResolution`（默认 `D`） |
| `legs` | `assetType:symbol` 逗号分隔，最多 4 |

无 query 时读 `localStorage` key `qstock.multi-chart.v1`。

---

## 3. 非目标

- 单图叠加相对强弱 / 指数对比线（另案）。  
- 多周期同票分格、十字光标 / 可视区间硬同步。  
- 实盘盘口、L2、完整 `SymbolChartSection` 工具条复制四份。  
- 侧栏新一级导航、sitemap 爆炸式动态 legs。

---

## 4. 验收

- [ ] 2/4 格可换标的出图；改全局周期各格同步  
- [ ] 分析篮 2–4 只 CTA 带入正确 `legs`；顶栏可回分析并见 legs 摘要  
- [ ] 格头「更换」可内联换标；无每格画线工具条；默认轻量指标  
- [ ] 刷新 / 分享 URL 可恢复布局  
- [ ] 无法超过 4 格；空格可搜索添加  
- [ ] 单源文件 &lt;500 行；无请求路径全表扫描  

---

## 5. 实现落点

| 能力 | 路径 |
|---|---|
| 页 | `src/app/[locale]/multi-chart/page.tsx` |
| UI | `src/components/multi-chart/*` |
| 状态 | `use-multi-chart-layout.ts`（URL + localStorage） |
| 数据 | `useSymbolCandlesQuery` → `/api/candles` |
