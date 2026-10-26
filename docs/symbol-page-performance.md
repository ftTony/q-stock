# 个股页性能优化说明

> 范围：`/ [locale] /symbol /[assetType] /[symbol]` 工作台（图表 + 报价条 + 右栏 + 自选）。  
> 约束：生产机约 **1GB / 1 vCPU**，热路径避免并行风暴与无谓重挂载。  
> 更新：2026-10（本轮落地）

---

## 1. 优化目标

| 目标 | 说明 |
|---|---|
| 缩短首屏关键路径 | 进页只做「价 + 图 + 计划」必需请求，盘口/筹码等延后 |
| 降低持续负载 | 报价轮询、自选轮询、盘口推送不要默认全开 |
| 避免昂贵重挂载 | klinecharts（约 660KB ESM）切 Tab 不销毁 |
| 报价 tick 少牵连 | WS/轮询更新价时，图表子树尽量不跟着整树重绘 |

---

## 2. 优化前后对比（行为）

| 维度 | 优化前 | 优化后 |
|---|---|---|
| 右栏默认 Tab | 股票默认 **行情（Market）** → 立刻挂深度 WS + 资金/做空/筹码 | 默认 **计划（Plan）**（与 PRD 一致）；行情按需点开 |
| Market 次级面板 | 一进 Market 同步拉资金 / 做空 / 筹码（筹码再串行打 `/api/candles` T→D） | idle 后再挂；视口内 `IntersectionObserver` 才真正 mount；筹码优先 **D**（常与主图缓存命中） |
| 主区切 Tab | `tab !== chart` 时卸载 `chartSlot` → 回图表重 `init` klinecharts | 图表 **CSS `hidden` 保活**，不销毁实例 |
| 图表 loading | `loadingChart` 时整段换成骨架 → 有数据时也会卸图 | 已有 K 线时 **蒙层**；仅空数据首次加载才纯骨架 |
| 报价 HTTP 轮询 | 无价 / 无 push / 降级时固定 **3s**（易与顶栏指数轮询叠成风暴） | 无价 **5s**；其余走 `quotePollIntervalMs`（push 正常约 60s，降级约 5s） |
| 成交标注 API | 登录即拉 `filled` 订单 | 仅 `showTradeMarkers === true` 时请求 |
| 左侧自选 | 首次默认打开 + 45s 全量报价轮询 | 首次默认 **收起**；打开后再轮询 |
| 图表与报价隔离 | 每次 `quote` 更新重渲整页，`chartSlot` 内联 JSX 每次新引用 | `useMemo(chartSlot)` + `memo(SymbolChartSection)`，报价变、bars/flags 不变则图表不重渲 |
| 财报 metrics | idle `timeout: 2500` / 降级 1.2s | idle `timeout: 4500` / 降级 2.2s，让出首屏带宽 |
| AI 分析面板 | 随 tabs 静态打进主 chunk | `dynamic()` 进滚动体，非 AI Tab 不拉该块 |
| 右栏滚动条 | `qt-scroll` 默认 8px，视觉偏粗 | `.aw-rail-scroll` **4px** 细轨；全局 `qt-scroll` 收到 **5px** |

---

## 3. 分项说明（怎么优化的）

### 3.1 右栏默认「计划」——砍掉首屏盘口扇出

**文件：** `src/components/symbol/symbol-order-rail.tsx`

**问题：** 股票进页 `defaultTab → "market"`，`SymbolRailMarket` 立刻挂载 → 深度/分笔 WS + REST，以及资金/做空/筹码请求，和主图蜡烛抢带宽与 CPU。

**做法：** 默认恒为 `"plan"`；`SymbolRailMarket` 仅在用户点「行情」时 dynamic 挂载（原有 `next/dynamic` 保留）。

**收益：** 首屏少一整条盘口链路；符合 `trading-ui-design`「计划默认、盘口辅层」。

---

### 3.2 Market 次级面板延迟 + 可见再加载

**文件：** `src/components/symbol/symbol-rail-market.tsx`  
**相关：** `symbol-chips-panel.tsx`、`symbol-funds-panel.tsx`、`symbol-short-panel.tsx`

**问题：** 筹码面板对 `T` 再 `D` 串行拉 K 线，与主图蜡烛重复；资金/做空也非首屏必需。

**做法：**

1. 三块面板改为 `dynamic(..., { ssr: false })` 拆 chunk。  
2. `useDeferredMount(500)`：`requestIdleCallback`（或短 timeout）后再考虑挂载。  
3. `LazySection`：`IntersectionObserver`（`rootMargin`）进入视口才 render 子树，触发其内部 `useEffect` 请求。  
4. 筹码分辨率顺序改为 **`D` → `T`**，优先复用主图日线缓存。

**收益：** 点开行情后仍先看盘口；滚到下方才打次级 API，避免并行风暴。

---

### 3.3 图表保活（切 Tab / loading）

**文件：**

- `src/components/symbol/symbol-tabs-panel.tsx`
- `src/components/symbol/symbol-chart-section.tsx`

**问题：** 离开「图表」Tab 卸载插槽 → 回图表重新 `import("klinecharts")` + `init` + 指标同步，卡顿明显。

**做法：**

- 有 `chartSlot` 时始终挂在 DOM 上，非图表 Tab 用 `hidden` + `aria-hidden`。  
- `loadingChart && bars.length > 0`：保留 `CandleChart`，绝对定位脉冲蒙层。  
- 仅 `bars.length === 0 && loadingChart` 用整块骨架；分时空数据仍走 Empty。

**收益：** Tab 来回不再付 klinecharts 冷启动成本；换周期有数据时也不闪断画布。

---

### 3.4 报价轮询降压

**文件：** `src/components/symbol/use-symbol-page.ts`  
**依赖：** `src/hooks/use-quote-socket.ts` → `quotePollIntervalMs`

**问题：** `!hasPrice || !wsPush || wsDegraded` 一律 `3000`，REST-only 或降级时与顶栏指数轮询叠加，小机易抖。

**做法：**

- 尚无有效价：`5000`。  
- 否则：`quotePollIntervalMs({ enabled, connected, degraded, push })`  
  - push 健康：约 `60000`  
  - 降级 / 无 push：约 `5000`

**收益：** 有推送时几乎不靠 HTTP 刷价；降级路径也不再比工具函数更激进。

---

### 3.5 成交标记按需请求

**文件：** `src/components/symbol/symbol-chart-section.tsx`

**问题：** 登录用户打开个股就 `useTradingOrders({ status: "filled" })`，即使用户关掉买卖点标注。

**做法：** `enabled: signedIn && chartSettings.showTradeMarkers`；关闭标注时 `tradeMarkers=[]`。

**收益：** 少一条交易域 API；与图表设置开关一致。

---

### 3.6 自选默认收起

**文件：** `src/components/symbol/use-watchlist-resize.ts`  
**相关：** `symbol-watchlist-panel.tsx`（打开时才挂、且 `refetchInterval: 45_000`）

**问题：** 首次 `localStorage` 无键时默认打开 → 立刻多一份带报价的自选查询 + 45s 轮询。

**做法：** 无存储键时默认 `false`（关闭）；用户展开后仍写入 `OPEN_KEY` 记忆偏好。

**收益：** 首访关键路径少一块左栏网络与渲染。

---

### 3.7 报价驱动重渲隔离

**文件：** `src/components/symbol/symbol-page-client.tsx`、`symbol-chart-section.tsx`

**问题：** `useSymbolPage` 里 WS/`setQueryData` 更新 quote → 整页 Client 重渲；内联 `<SymbolChartSection />` 每次新 element，子树难跳过。

**做法：**

- `resolutionLabels` / `onFlagToggle` / `chartSlot` 用 `useMemo` / `useCallback` 稳住引用。  
- `SymbolChartSection` 包 `memo`；依赖不含 `quote`。

**收益：** 价在变、K 线与指标不变时，图表 React 层少跟跑（实例内部仍可走 ref 逻辑）。

---

### 3.8 财报 metrics 更晚 idle

**文件：** `src/components/symbol/use-symbol-tab-data.ts`

**问题：** 进页 idle 拉 `/api/earnings` 仅为右栏市值等，与蜡烛/报价抢前几秒。

**做法：** `requestIdleCallback` timeout `2500 → 4500`；无 idle API 时 `1200 → 2200`。

**收益：** 弱设备上首屏更稳；市值仍会补上，只是略晚。

---

### 3.9 Tabs 拆分 + AI 动态导入

**文件：**

- `src/components/symbol/symbol-tabs-types.ts`
- `src/components/symbol/symbol-tabs-scroll-body.tsx`
- `src/components/symbol/symbol-tabs-panel.tsx`

**问题：** 单文件过大（超 500 行软限）；`AiAnalysisPanel` 静态进 tabs 主路径。

**做法：** 类型下沉；滚动 Tab 体拆到 `symbol-tabs-scroll-body`；AI / 基本面面板 `dynamic`。

**收益：** 主路径更瘦；满足文件体积约束，利于后续继续拆。

---

### 3.10 右栏滚动条视觉（附带体验）

**文件：** `src/components/symbol/apple-workbench.css`、`src/app/globals.css`

**问题：** 分时成交区域系统/8px 滚动条显粗，挤窄列。

**做法：** `.aw-rail-scroll` 宽 **4px**、透明轨道；全局 `.qt-scroll` **5px** + `scrollbar-width: thin`。

**收益：** 不改交互，信息密度更接近交易台。

---

## 4. 关键路径（优化后理想顺序）

```text
SSR 报价（cache） 
  → hydrate：报价条 + 图表动态 chunk + 右栏「计划」
  → WS 订阅单标的（有则少 HTTP）
  → 蜡烛 /api/candles
  → idle：earnings metrics（市值）
  → 用户点「行情」：深度/分笔
  → 滚到下方：资金 / 做空 / 筹码
  → 展开自选：自选列表 + 45s 报价
```

---

## 5. 主要改动文件清单

| 文件 | 作用 |
|---|---|
| `symbol-order-rail.tsx` | 默认 Plan |
| `symbol-rail-market.tsx` | idle + IO 懒挂载次级面板 |
| `symbol-chips-panel.tsx` | 蜡烛分辨率 D→T |
| `symbol-tabs-panel.tsx` | 图表保活 |
| `symbol-tabs-scroll-body.tsx` / `symbol-tabs-types.ts` | 拆分 + AI dynamic |
| `symbol-chart-section.tsx` | memo、loading 蒙层、标注按需 |
| `symbol-page-client.tsx` | memoized `chartSlot` |
| `use-symbol-page.ts` | 报价轮询策略 |
| `use-watchlist-resize.ts` | 自选默认关 |
| `use-symbol-tab-data.ts` | earnings idle 延后 |
| `apple-workbench.css` / `globals.css` | 细滚动条 |

---

## 6. 建议自测清单

- [ ] 进美股个股：右栏默认 **计划**；Network 初期无深度/筹码/资金（未点行情前）。  
- [ ] 点「行情」：盘口出现；滚到底才见筹码请求。  
- [ ] 图表 → 基本面 → 回图表：无明显整图白屏/二次长时间转圈。  
- [ ] 推送正常时：报价 HTTP 间隔应接近分钟级，而非 3s。  
- [ ] 设置关闭「买卖点」：无 filled orders 请求。  
- [ ] 清 localStorage 后进页：左侧自选收起。  
- [ ] 右栏分时成交滚动条目视细于改前。

---

## 7. 已知未做 / 后续可选项

| 项 | 说明 |
|---|---|
| 报价条独立订阅边界 | 可用更薄的 quote 子树 / `useSyncExternalStore`，进一步让 `SymbolTabsPanel` 少吃 tick |
| ScopedMessages 裁剪 | 个股页仍带较多 AI/交易文案命名空间，可按 Tab 再拆 |
| 顶栏指数 3s 路径 | 壳层轮询与个股页叠加问题需单独收一档 |
| React Compiler | 仓库未开；当前依赖显式 memo，开 Compiler 后可再收一波手写 memo |
| Market 深度本地节流 | 行情 Tab 打开后分笔仍可能高频 `setState`，可做 rAF 合并 |

---

## 8. 原则回顾（给后续改动）

1. **默认路径 = PRD 主路径**（计划 + 图表），辅层按需。  
2. **能保活就不重挂**（尤其第三方重型图表）。  
3. **轮询跟 push 状态走工具函数**，禁止再写更短的魔法间隔。  
4. **列表/次级面板：idle → 可见 → 再请求**。  
5. **小机友好**：宁可数据晚几百毫秒，也不要进页并行打满。
