# 金融图表常用技术整理

面向行情 / 交易类产品里的 K 线、分时、盘口附属图、资产曲线等。和 [Longbridge 网页交易端技术整理](./longbridge-web-trade-tech.md) 互补：那边是单一产品的实证拆解，本文是行业里常见的技术地图。

Q-Stock 一期图表选型见 [需求文档](./requirements.md)：TradingView **lightweight-charts**（Canvas 2D）。下文会标明各方案适合什么阶段。

## 1. 金融图在画什么

| 类型 | 典型内容 | 对渲染的要求 |
|---|---|---|
| K 线 / OHLC / 美国线 / 平均 K | 开高低收、成交量副图 | 大量矩形/影线、缩放平移要跟手 |
| 分时 / 多日分时 | 价线 + 均价 + 成交量 | 盘中持续追加点 |
| 指标 | MA/EMA/BOLL/MACD/RSI 等 | 与主图对齐的叠加线/柱 |
| 深度 / 盘口可视化 | 买卖挂单面积或阶梯 | 高频刷新、颜色分区 |
| 逐笔 / Time & Sales | 列表为主，偶有迷你图 | 更偏表格 |
| 热力图 / 树图 | 板块涨跌 | 矩形树或 GPU 色块 |
| Sparkline | 列表内迷你走势 | 极轻量，常直接 Canvas/SVG |
| 资产 / 收益曲线 | 净值、回撤 | 中低频，ECharts 一类也够用 |

难点通常不在“画出一根蜡烛”，而在：**实时追加、多周期切换、十字线同步、画线工具、指标参数、图上交易覆盖层**，以及主线程不能被推送打爆。

## 2. 渲染底层

### 2.1 对照

| 技术 | 原理 | 优势 | 代价 | 金融场景里谁在用 |
|---|---|---|---|---|
| **SVG / DOM** | 每个图元一个节点 | 易做标注、无障碍、CSS 好控 | 上千根 K 线 DOM 爆炸 | 报表、少量点的资产图；很少做主图 K 线 |
| **Canvas 2D** | 立即模式位图绘制 | 实现简单、兼容好、库生态最大 | 主线程绘制；极高密度时吃 CPU | TradingView Charting Library、lightweight-charts、KLineChart、多数券商自研 |
| **WebGL / WebGPU** | GPU 画三角形/线段 | 十万级点仍可跟手；可离屏 | 工程重、字体与对齐麻烦、调试难 | SciChart.js、部分自研终端、游戏级行情 |
| **WebAssembly** | 近原生算力跑在浏览器 | 指标、聚合、协议解析快；可配合 Canvas/WebGL | 包体大、胶水层成本 | 指标引擎、协议解码；SciChart 等用 WASM+WebGL 一体 |
| **OffscreenCanvas + Worker** | 绘制移出主线程 | 缩放时少卡 UI | 浏览器支持与输入事件桥接要自己做 | 高性能自研、截图导出 |
| **原生 GPU UI** | 桌面直接 Metal/DX/Vulkan 或 GPUI | 120FPS 级多屏 | 非 Web | Longbridge Pro（GPUI）、部分柜台 |

经验规则：

- **看盘 + 普通交易 Web**：Canvas 2D 足够，优先成熟库。
- **同屏多图、Level-2 极密、科研级回放**：再考虑 WebGL/WASM。
- **不要**因为“金融”就默认上 WebGL；很多顶级网页终端主路径仍是 Canvas 2D。

### 2.2 Canvas 2D 常见优化

- 按帧合并重绘（`requestAnimationFrame`），禁止“每个 tick 清屏重画全量历史”。
- 只重绘脏区或分层：背景网格 / 蜡烛 / 指标 / 十字线分 canvas 叠层。
- 设备像素比（`devicePixelRatio`）处理清楚，避免模糊或超大 canvas。
- 长历史用“视口窗口 + 左右预取”，不要一次绑 10 年 1 分钟线进内存还全量画。
- 价格、时间轴用整数像素对齐，减少亚像素发虚。

### 2.3 WebGL / WASM 常见分工

```text
行情 tick / 快照
    → WASM：协议解码、K 线聚合、指标滚动窗口
    → TypedArray 传给渲染器
    → WebGL：线段/蜡烛实例化绘制
    → DOM：下单条、按钮、Tooltip（或也画进 canvas）
```

主线程只做输入与合成；计算和绘制尽量不堵在 Vue/React 的 commit 阶段。

## 3. 常用图表库

### 3.1 交易终端向

| 库 | 渲染 | 许可 / 成本 | 特点 | 适合 |
|---|---|---|---|---|
| **TradingView Lightweight Charts** | Canvas（fancy-canvas） | Apache-2.0 | 轻、API 稳、实时候补友好；指标与画线要自建 | Q-Stock 一期；嵌入式行情 |
| **TradingView Charting Library** | Canvas 为主 | 商业授权 | 画线、指标、多布局、英语生态完整；需自接 datafeed | 券商网页专业图表（Longbridge 有对接） |
| **KLineChart** | Canvas | 开源 | 指标、副图、移动端手势较全，体积小 | 中文社区、H5 行情 |
| **HQChart / 同类国内引擎** | Canvas | 视具体项目 | 传统行情终端功能集接近 | 强定制国内看盘 |
| **SciChart.js** | WebAssembly + WebGL | 商业 | 主打大数据量实时金融图 | 超高频、大数据演示 |
| **TechanJS / d3 拼装** | SVG | 开源 | 灵活但要自研交互 | 原型、非主路径 |
| **Fintech charts（自研）** | Canvas / WebGL | 内部 | 图上交易、成本线、筹码完全可控 | 大型券商（如 Longbridge Classic） |

### 3.2 通用可视化（资产、报表、情绪）

| 库 | 说明 |
|---|---|
| **Apache ECharts** | 资产曲线、持仓饼图、板块柱状；不适合当主力交易 K 线 |
| **AntV G2 / G2Plot** | 业务报表、统计分析 |
| **Recharts / Visx** | React 生态中低频图 |
| **D3** | 定制坐标与非常规图；成本高 |

选型口诀：**交易主图用金融专用库；经营分析用通用 BI 库。** 不要用 ECharts 硬撑 Level-2 盘口动画。

## 4. 数据与协议层（图表上游）

图表库不管行情从哪来，前端仍要接这些技术：

| 技术 | 用途 |
|---|---|
| **WebSocket / 私有二进制** | 实时推送；金融里常见 Protobuf / FlatBuffers / 自定义二进制 |
| **增量字段 + sequence** | 只更新变化价；丢包后拉快照补偿 |
| **REST 历史 K 线** | 首屏与翻页；注意复权、交易时段、夜盘 |
| **客户端聚合** | tick → 1m/5m K；或分钟 → 日/季/年（Q-Stock 季 K/年 K 即本地聚合） |
| **复权算法** | 前复权 / 后复权 / 不复权；分红除权后历史要重算或换源 |
| **WASM 行情客户端** | 解码与订阅放进 WASM（见 Longbridge `wsclient_*`） |

图表组件的理想输入是已经对齐好的：

```ts
{ time: number; open: number; high: number; low: number; close: number; volume?: number }[]
```

复权、时区、交易时段尽量在数据层做完，不要散落在每个 series 的绘制函数里。

## 5. 交互与业务叠加（库之上还要做的）

| 能力 | 常见实现技术 |
|---|---|
| 十字线 / Tooltip | 库内置 + 自定义 HTML overlay |
| 缩放平移 | 触摸手势、滚轮、Y 轴独立缩放 |
| 画线工具 | 趋势线、斐波那契、矩形；自研命中检测或 TV Charting Library |
| 指标面板 | 主图叠加 + 副图 pane；参数面板与本地存储 |
| 公司行动标记 | 在时间轴打 markers（分红、拆股、财报） |
| 成本线 / 买卖点 | 水平价位线 + 订单成交点；需账户数据 |
| 图上交易 | DOM 浮层对齐 canvas 坐标；拖动改价再下单 |
| 多图联动 | 共享 time scale 或自定义 sync bus |
| 截图分享 | `canvas.toDataURL` / OffscreenCanvas |

Longbridge 的经验值得记一笔：自研图与 TradingView **能力集不同**（例如止盈止损线只在 Classic），产品必须写清，前端不能 silently 丢覆盖层。

## 6. 和框架的集成方式

| 方式 | 说明 |
|---|---|
| **React / Vue 包一层** | 生命周期里 `createChart` / `remove`；数据用 imperative API `setData` / `update`，避免把每根 K 线放进响应式代理 |
| **Web Component** | 多框架嵌入同一图表 |
| **微前端 / iframe** | 隔离 TradingView 商业包与主应用样式 |
| **Electron / 桌面壳** | 同一套 Canvas 图；桌面可再上原生 GPU 方案 |

反模式：把 `candles[]` 做成深度 `reactive`/`useState` 且每秒替换整数组。应：**不可变参考 + 图表实例命令式更新**，UI 状态（周期、指标开关）才进框架状态。

## 7. 性能清单（金融图专用）

1. 首屏只拉可视区 + 少量缓冲，滚动再预取。
2. 实时 `update` 最后一根，不要每次 `setData` 全量。
3. 推送合并到动画帧；后台 tab 降频。
4. 指标在 Worker/WASM 算，主线程只收 TypedArray。
5. 多图时共享一份行情订阅，不要每块图各自连 WS。
6. 销毁图表时卸事件、退订行情、释放 canvas，防泄漏。
7. 移动端降 DPR 或降动画，优先跟手。

## 8. 技术组合模板

### A. 轻量行情站（Q-Stock 一期）

```text
Finnhub REST → BFF 缓存 → lightweight-charts（Canvas）
指标：TS 本地算 MA/EMA/BOLL/RSI/MACD
交互：周期切换、主题色、基础 crosshair
```

够用，迭代快。缺：高级画线、图上交易、超大历史流畅度。

### B. 券商网页专业看盘

```text
二进制 WS →（可选 WASM 解码）→ 自研 Canvas 引擎或 TV Charting Library
双模式：Classic（图上交易）+ TradingView（画线生态）
订阅令牌桶 + sequence 补偿 + 权限降级
```

工程量大，功能完整。

### C. 超高密度实时

```text
WASM 聚合 + WebGL/WebGPU 绘制（SciChart 或自研）
Worker 出图；DOM 只做下单条
```

适合专业终端、量化可视化；授权与人才成本高。

### D. 桌面多屏

```text
Rust/C++/GPUI 等原生 GPU UI + 同一套行情协议
Web 版降级为 Canvas 同构业务，或 WebView 嵌网页图
```

## 9. 和本仓库的对应关系

| 项 | Q-Stock 现状 | 可演进方向 |
|---|---|---|
| 主图 | `lightweight-charts` v5，`src/components/charts/` | 保持；深耕 `update` 与主题 |
| 指标 | `src/lib/indicators/` | 指标多了可考虑 Worker |
| 周期聚合 | `src/lib/candles/` 季 K / 年 K | 复权规则若上线需进数据层 |
| 实时 | REST 轮询 | 若上 WS，图表侧改为增量 `update` |
| Sparkline | 列表迷你图 | 继续轻量 Canvas/SVG，勿上完整 K 线库 |
| 对照样本 | [longbridge-web-trade-tech.md](./longbridge-web-trade-tech.md) | 双引擎、WASM WS、图上交易 |

## 10. 一句话选型

- 要 **快上线、开源、嵌入 React/Next**：lightweight-charts。
- 要 **画线/指标开箱、商业授权可接受**：TradingView Charting Library。
- 要 **国产开源、指标副图全**：KLineChart。
- 要 **海量点 + 极致实时**：WebGL/WASM（SciChart 或自研）。
- 要 **图上交易 / 筹码 / 成本线深度定制**：自研 Canvas 引擎，必要时 TV 作第二模式。
- 资产报表、情绪条：**ECharts / G2**，不要塞进交易主图技术栈。

## 参考

- [TradingView Lightweight Charts](https://tradingview.github.io/lightweight-charts/)
- [TradingView Charting Library 概述](https://www.tradingview.com/charting-library-docs/)
- [KLineChart](https://klinecharts.com/)
- [SciChart.js（WASM + WebGL）](https://www.scichart.com/javascript-chart-features/)
- [Longbridge 网页交易端技术整理](./longbridge-web-trade-tech.md)
- 本仓库实现：`src/components/charts/candle-chart.tsx`
