# PRD：个股图表形态（Chart Types）

| 项 | 内容 |
|---|---|
| 产品 | 钱力股 / Q-Stock |
| 范围 | `/symbol/...` 主图（KLineChart） |
| 状态 | **P0 已落地**；P1 / P2 规划中 |
| 相关 | [个股交易台 UI](./symbol-trading-ui.md) · [金融图表技术](../financial-chart-tech.md) · [策略方向](../strategy-backtest-direction.md) |

---

## 1. 背景与目标

现状（改版前）：图表形态与周期绑死——分时 `T` 固定面积图，其它周期固定实心蜡烛。

参考 Robinhood：

- **主 App**：基础形态主要是 **Line/面积 ↔ Candlestick**，周期粗粒度，默认偏趋势面积。
- **Legend**：Area / Line / Candle / Bar / Baseline / Equivolume 等终端向形态。

钱力股定位是规则驱动看盘台，**默认仍偏蜡烛**（便于叠规则价、回放点），同时允许切换面积图做「一眼趋势」。后续形态只服务冷静看盘与计划对照，不做成 Legend 式组件市场。

**目标**

- 周期选时间粒度，形态独立切换。
- 形态数量克制：P0 两种 → P1 补终端常用 → P2 贴合「计划 / 失效」叙事。
- 偏好本地持久；未选手动时保留智能默认。

**总非目标**

- 换第二套图表库或复制 Robinhood Legend 全套图型。
- Equivolume、点数图、Renko、多形态插件市场。
- 为换形态增加额外行情请求（同源 OHLCV）。
- 服务端同步图表偏好（可后置，非本 PRD 范围）。
- 图上直接「市价下单」（与冷静投冲突）。

---

## 2. 范围分层总览

| 阶段 | 形态 / 能力 | 产品意图 |
|---|---|---|
| **P0** | `candle` · `area` | 趋势一眼 vs 结构细看；已落地 |
| **P1** | `candle_stroke`（空心烛）· `ohlc`（棒线）· 可选纯 `line` | 进阶终端观感，仍不离 OHLCV |
| **P2** | `baseline` + 基准源（昨收 / 成本 / 失效价） | 相对规则价看上下，服务计划栏 |

---

## 3. P0 — 蜡烛 / 面积（已落地）

| 能力 | 说明 |
|---|---|
| 形态 | `candle`（实心蜡烛）· `area`（面积/趋势） |
| 入口 | 主图工具条周期旁**下拉**；设置菜单同步列表 |
| 默认 | 未选手动：`T` → area，其它 → candle |
| 记忆 | `localStorage`：`qstock.chartSettings.v1` |
| 实现 | KLineChart `candle.type`：`candle_solid` / `area` |

### 交互

```text
工具条：[分时][1分][5分][日][季][年] | [蜡烛 ▾] | MA MACD … | 截图 设置 全屏
```

- 形态入口为**下拉菜单**（当前值 + 箭头），便于后续增加空心烛 / OHLC / baseline 等而不撑破工具条。
- 选项列表集中在 `candle-chart-type-options.ts`；工具条与设置菜单共用。
- 切换形态不改 `resolution`、不重拉 K 线（仅 `setStyles`）。
- 截图导出使用当前形态。

### 偏好模型（P0）

```ts
type ChartCandleType = "candle" | "area";

type ChartUiSettings = {
  showTradeMarkers: boolean;
  /** 用户显式选择；缺省则按周期智能默认 */
  chartType?: ChartCandleType;
};

function resolveCandleType(settings, resolution): ChartCandleType {
  if (settings.chartType === "candle" || settings.chartType === "area") {
    return settings.chartType;
  }
  return resolution === "T" ? "area" : "candle";
}
```

KLine 映射：`candle` → `candle_solid`，`area` → `area`。

### 验收 P0

- [x] 工具条可在蜡烛 / 面积间切换，与周期解耦
- [x] 未选手动时分时为面积、日线为蜡烛
- [x] 手动选择后刷新页面仍保留
- [x] 切换不触发多余 K 线请求
- [x] 截图与当前形态一致
- [x] 中英等文案具备；文件保持 &lt;500 行

---

## 4. P1 — 进阶 OHLC 形态

> 目标：满足「更像专业终端」的观感，仍只用现有 OHLCV，不引入新数据源。

### 4.1 形态定义

| 产品 key | 展示名（建议） | KLine / 渲染 | 何时有用 |
|---|---|---|---|
| `candle` | 蜡烛（实心） | `candle_solid` | 默认结构看盘（P0） |
| `candle_stroke` | 空心蜡烛 | `candle_stroke`（若库支持；否则描边实心近似） | 密图时减少色块压迫 |
| `ohlc` | OHLC 棒线 | `ohlc` / `candle_bar`（以 KLineChart 实际枚举为准） | 窄屏、多股对照时更省宽 |
| `area` | 面积 | `area` | 趋势一眼（P0） |
| `line`（可选） | 折线 | `line` 或 area 去填充 | 比面积更素；若与 area 难区分可只做 area |

**建议首发**：在 P0 基础上增加 **`candle_stroke` + `ohlc`**；`line` 仅当与 `area` 差异足够大再加，避免工具条拥挤。

### 4.2 交互

```text
工具条形态区：统一「当前形态 ▾」下拉（P0 已采用）
设置菜单：同选项列表，与工具条双向同步
新增类型：只改 CHART_TYPE_OPTIONS + 文案 + toKlineCandleType 映射
```

规则：

- 形态列表顺序固定：蜡烛 → 空心 → OHLC → 面积（→ 折线）。
- 切换仍只 `setStyles`，不重置缩放、不丢画线、不丢指标。
- 交易打点、规则价虚线在所有 P1 形态下尽量可见；面积/折线上打点用点或三角，避免烛身依赖。

### 4.3 偏好模型扩展

```ts
type ChartCandleType =
  | "candle"
  | "candle_stroke"
  | "ohlc"
  | "area"
  | "line"; // 可选

// ChartUiSettings.chartType 沿用同一字段；旧值 candle|area 继续合法
```

`resolveCandleType`：未选手动时逻辑与 P0 相同（仅在 `candle` / `area` 间智能默认）；用户选过 `ohlc` 等则全周期沿用。

### 4.4 实现注意

- 落地前核对当前 `klinecharts` 版本支持的 `candle.type` 枚举，在 `toKlineCandleType` 集中映射。
- 不支持的类型：UI 不展示，或展示但禁用并 tooltip「当前引擎暂不支持」。
- 截图 / 主题色 / 涨跌色切换须覆盖新类型。
- 文件拆分：形态菜单可抽 `candle-chart-type-control.tsx`，避免 `symbol-chart-section` 超 500 行。

### 4.5 验收 P1

- [ ] 用户可切换至空心蜡烛与 OHLC；刷新后偏好保留
- [ ] 日线选 OHLC 后切到分时，仍为 OHLC（显式偏好优先于智能默认）
- [ ] 面积 ↔ OHLC 切换不重拉 K 线、画线与指标仍在
- [ ] 模拟买卖打点在 OHLC / 空心烛上可读
- [ ] 窄屏形态入口不撑破工具条（菜单或「形态 ▾」）
- [ ] 文案全语言同步；无支持的类型不出现或明确禁用

### 4.6 P1 明确不做

- Baseline / 相对基准染色（归 P2）
- Heikin-Ashi、平均K（易误导学习用户，且与「真实 OHLC 规则对照」冲突）
- 按资产类型强制锁定形态（用户偏好优先）

---

## 5. P2 — Baseline 与规则基准

> 目标：让图表直接回答「相对我关心的价，现在在上还是在下？」——对齐计划栏的失效价 / 成本 / 昨收，而不是再堆一种炫技图型。

### 5.1 形态与基准源

| 能力 | 说明 |
|---|---|
| 形态 `baseline` | 价格相对一条水平基准线；之上 / 之下用涨跌色面积填充（类 Robinhood Legend Baseline） |
| 基准源 `baselineSource` | `prevClose`（昨收）· `avgCost`（持仓成本，登录且有仓）· `invalidation`（计划/订单失效价）· `custom`（用户拖或输入） |
| 默认基准 | 有绑定失效价 → `invalidation`；否则有持仓 → `avgCost`；否则 → `prevClose` |

### 5.2 与产品闭环的关系

| 闭环环节 | Baseline 用法 |
|---|---|
| 计划 | 基准 = 当前规则失效价；图上可见「是否仍在计划有效区」 |
| 模拟持仓 | 基准 = 成本；弱化追涨叙事，强化相对成本 |
| 复盘 | 可选：回看某笔成交时的失效备注价作基准（只读） |

文案中性：「相对基准」；不写「你已亏 / 你该跑」。

### 5.3 交互

```text
形态选「基准」后，工具条或图例旁出现：
  基准：昨收 | 成本 | 失效价 | 自定义
不可用项禁用（无持仓则「成本」灰掉；无失效价则「失效价」灰掉 + 链到计划 Tab）
自定义：拖动水平线 或 输入价；拖动结果写回 baselineCustomPrice（本地）
```

- 主图叠基准线（实线）与可选规则其它价位（虚线，避免抢视线）。
- 从「计划」Tab 一键「用失效价作基准」→ 切到 `baseline` + `invalidation`。
- 切换离开 baseline 时记住上次 `baselineSource`，再回来恢复。

### 5.4 偏好模型扩展

```ts
type ChartCandleType =
  | "candle"
  | "candle_stroke"
  | "ohlc"
  | "area"
  | "line"
  | "baseline";

type BaselineSource =
  | "prevClose"
  | "avgCost"
  | "invalidation"
  | "custom";

type ChartUiSettings = {
  showTradeMarkers: boolean;
  chartType?: ChartCandleType;
  baselineSource?: BaselineSource;
  baselineCustomPrice?: number;
};
```

运行时解析基准价（不进 localStorage 的瞬时值也可）：

```ts
function resolveBaselinePrice(ctx): number | null {
  // prevClose ← 报价；avgCost ← 持仓；invalidation ← 计划绑定/草稿；
  // custom ← settings.baselineCustomPrice
}
```

无合法基准价时：不渲染虚假 baseline，回退蜡烛并 toast / 行内提示「暂无基准价」。

### 5.5 数据与容量

- 昨收：现有 quote，不新增风暴请求。
- 成本：现有 paper position。
- 失效价：计划绑定策略摘要或用户下单 `invalidationNote` 中可解析的价；若仅为自然语言备注无法解析，则「失效价」不可用并提示去计划填结构化失效价（若产品已有字段则用之）。
- 小机：baseline 为前端样式 + 一条水平线，禁止为此轮询深度行情。

### 5.6 实现注意

- 优先用 KLineChart 自带 baseline / area 相对填充；若版本不支持，可用折线 + 半透明 fill + 水平 mark 近似，并在 PRD 实现备注写清。
- 与规则回放买卖点叠加时：基准线 z-index 低于成交点、高于网格。
- 主题：上/下填充跟 `--up` / `--down`（用户涨跌色方案）。

### 5.7 验收 P2

- [ ] 可选 baseline；能选昨收 / 成本 / 失效价（在数据可用时）
- [ ] 无持仓时「成本」禁用；无失效价时「失效价」禁用并有去计划入口
- [ ] 计划 Tab「用失效价作基准」可跳转并正确设形态与源
- [ ] 自定义基准可拖/可输入，刷新后保留
- [ ] 无基准价时安静降级，不画错误填充
- [ ] 文案中性；不把相对基准盈亏做成大标题或「建议」

### 5.8 P2 明确不做

- Equivolume、多基准同时填充、基准回测统计大盘
- 把 baseline 相对涨跌幅当收益承诺或排行依据
- 云端同步多设备图表布局

---

## 6. 分期与依赖

| 阶段 | 依赖 | 预估 |
|---|---|---|
| P0 | 无 | **已完成** |
| P1 | KLineChart 类型能力确认；工具条拥挤度设计 | 小（1～3 天） |
| P2 | 计划栏结构化失效价或可解析字段；持仓成本只读接口（已有则可复用） | 中（需联调计划/持仓） |

建议：P1 做完再开 P2；P2 与[个股交易台](./symbol-trading-ui.md)计划摘要同一迭代更顺。

---

## 7. 实现映射

| 模块 | 路径 |
|---|---|
| PRD | `docs/prd/symbol-chart-types.md` |
| 偏好 | `src/components/charts/candle-chart-settings.ts` |
| 样式映射 | `src/components/charts/candle-chart-styles.ts`（`toKlineCandleType`） |
| 工具条 | `src/components/symbol/symbol-chart-section.tsx` |
| 形态下拉 | `src/components/charts/candle-chart-type-menu.tsx` |
| 形态选项表 | `src/components/charts/candle-chart-type-options.ts` |
| 设置菜单 | `src/components/charts/candle-chart-settings-menu.tsx` |
| 主图 | `src/components/charts/candle-chart.tsx` |
| P2 基准解析 | `src/lib/charts/resolve-baseline-price.ts`（新建） |
