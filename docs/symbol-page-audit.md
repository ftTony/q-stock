# 个股详情页审查报告

> 审查对象：`/symbol/[assetType]/[symbol]`（`src/app/[locale]/symbol/[assetType]/[symbol]/page.tsx` → `src/components/symbol/symbol-page-client.tsx`）
> 审查日期：2026-10-27
> 审查方式：代码静态审查 + 浏览器实测（CDP 设备模拟，1440×900 / 390×844，亮/暗双主题）+ DOM 与网络审计
> 综合评分：**7.3 / 10**

---

## 一、总评

这是一张**功能密度超出个人项目水平、但产品化细节没跟上的**专业看盘页。功能覆盖已经接近中型终端，架构选型（代码分包、轮询分层、依赖克制）也明显是想过的；真正拖分的是三件"不像功能但决定信任"的事：空态与加载态混在一起、实时状态不可见、键盘操作走不通。

| 维度 | 分数 | 判断依据 |
|---|---|---|
| 产品功能 | 8.5 / 10 | 图表 + 衍生品 + 基本面 + 资讯 + 模拟下单 + 计划 + 复盘 + AI，广度足够 |
| 交互合理性 | 7.5 / 10 | 熟练用户顺手，新用户前 30 秒找不到北 |
| UI 一致性 | 7.0 / 10 | 个股页自成一套视觉语言，与站点其他页面割裂 |
| 前端性能 | 7.0 / 10 | 架构正确，但首屏数据链路起点错了 |
| 可访问性 | 5.5 / 10 | ARIA 语义做了一半，键盘操作走不通 |
| 工程可维护性 | 7.0 / 10 | 11600 行拆成 40+ 文件是优点，但主容器已成第二大脑 |

---

## 二、实测证据

| 项目 | 结果 |
|---|---|
| 桌面 1440×900 亮色 | 五区布局正常：左自选列 / 中图表+标签 / 右信息栏 / 最右图标条 / 顶部报价条 |
| 桌面 1440×900 暗色 | 文字对比度可读，K 线红绿与品牌强调色接近，层次偏弱 |
| 移动端 390×844 | 右栏与自选列隐藏，仅保留报价条 + 图表 + 图标条；交易与 AI 走全屏抽屉 |
| 基本面标签 | 内容完整（三表 / 日历 / 高管 / 简况 / 二级标签），信息密度高但可读 |
| 交易抽屉 | 覆盖式抽屉，表单完整（方向 / 价格 / 数量 / 费用 / 提交） |
| 横向溢出 | `scrollWidth === innerWidth`，桌面与移动端均无溢出 |
| 页面组件规模 | `src/components/symbol/*` 合计 11612 行，最大 `symbol-page-client.tsx` 459 行 |
| 依赖数量 | 25 个；图表用 `klinecharts`，无 echarts / d3 等重型库 |
| 首屏服务端预取 | 仅 `initialQuote`；K 线走客户端 fetch |

**未覆盖**：本地无登录会话、无行情 Key，交易下单、计划面板、AI 推荐的真实链路只做静态审查，未端到端跑通。

---

## 三、产品功能

### 已覆盖

- 图表：多分辨率（分时 / 1m / 5m / 日 / 季 / 年），成交量，浮动提示
- 衍生品：期权链（`option-chain-board.tsx` 466 行）、权证（`warrant-board.tsx` 238 行）
- 基本面：利润表 / 资产负债表 / 现金流量表 / 财报日历 / 公司概况 / 高管 / EPS 图
- 资讯：新闻、公告、评论、情绪（各自独立 API，dock 抽屉承载）
- 交易：模拟下单抽屉
- 计划：右栏计划面板（可绑定规则 `ruleBadgeBound`）
- 复盘：`symbol-review-rail.tsx`
- 辅助：筹码分布、资金流（bars + donut）、分享菜单、自选管理、提醒条、AI 问股

这个广度不需要再扩了，继续加只会增加认知负荷。

### 更正：图表能力比初判强

初版报告称"图上没有指标叠加，也没有画线工具"，此为**误判**，已核实更正：

- 指标：`candle-chart-overlays.tsx` 的 `IndicatorFlags` 含 **MA / EMA / BOLL / RSI / MACD**
- 画线：`chart-drawing-icons.tsx` + `DRAWING_TOOLS` 含**线段、射线、直线、水平线等 6 种**，并有 `clearDrawings`
- 成交标记：`syncTradeMarkers` 把用户自己的成交点直接打在 K 线上（`USER_DRAWINGS_GROUP`）
- 其他：多图表类型切换（`candle-chart-type-options`）、截图导出、全屏

**这套图表能力已超出多数零售看盘页**，尤其是"成交点回标到图上"——它是复盘的核心视觉，也正好印证产品定位。

真正缺的是**叠加对比**（个股 vs 指数相对强弱）与**多标的同屏**，属于增强项而非硬缺失。

### 缺口二：「计划」与「下单」概念重叠

- 计划面板在**右栏**
- 模拟下单在**交易抽屉**

两者都引导用户做同一件事（记录/执行一个交易意图），但入口不同、术语不同、状态不互通。新手无法判断哪个是"记录想法"、哪个是"模拟成交"。建议统一为一个入口 + 两种模式（草稿 / 成交）。

---

## 四、交互合理性

### 4.1 空态与加载态混在一起（影响第一印象）

无行情凭证时，图表区与右栏长时间停在骨架屏。实测右栏空白持续 10 秒以上，截图无法判断是"未配置 Key"还是"网络慢"。

**建议**：`/api/quotes` 返回"未配置凭证"时立即渲染配置引导卡片（复用 `market-credentials-prompt.tsx` 的样式语言），不要继续转圈。

**涉及**：`src/components/symbol/symbol-rail-*.tsx`、`src/components/ui/panel-skeleton.tsx`

### 4.2 AI 面板点击后无反应

在侧边图标栏点击 AI 图标后：

- DOM 中查不到 `role="dialog"` 节点
- 无任何 toast / 提示 / 加载态
- 图标选中态与面板可见性无关联

通过 CDP 遍历几何链确认面板未挂载（不是"渲染在视口外"）。两种可能：`onSideSelect("ai")` 与 `aiOpen` 状态不同步，或需要登录但静默失败。

**无论哪种，用户感知都是"按钮坏了"。** 这是当前最伤转化的一个点。

**涉及**：`symbol-page-client.tsx` 的 `onSideSelect` → `symbol-ai-fab.tsx`

### 4.3 实时状态完全不可见

`use-symbol-page.ts` 计算了 `wsConnected / wsDegraded / wsPush`，并用它们决定轮询间隔（推送 60s / 降级 5s / 无价 5s）——但 40+ 个 symbol 组件里**没有一处**渲染这三个值。

用户在页面上无法知道当前价格是 WebSocket 推送的、还是 5 秒轮询的、还是连接已经断了。对行情产品来说这是基本信任项。

**建议**：报价条右侧加一个状态点 + 文案（实时 / 延迟 5s / 已断开），数据已经在 hook 里，纯展示改动。

**涉及**：`symbol-quote-bar.tsx`、`use-symbol-page.ts:122-144`

### 4.4 首次进入的心智负担

侧边图标条只有图标、无文字标签（hover 才出 title），依赖 spotlight tour 解释。但 tour 一旦关闭（写入 `localStorage` 的 `qstock:path-guide-dismissed:v2`）就再也不会出现，产品里没有"重新播放引导"的入口。

**建议**：设置页 → 关于，增加「重新查看引导」。

### 4.5 移动端触摸目标偏小

390px 下报价条动作按钮 gap 仅 1.5（6px），按钮高度约 32px，低于移动端推荐的 44px 触摸目标下界。误触率会偏高。

---

## 五、UI 一致性

### 5.1 两套视觉语言并存

个股页使用独立的 `aw-*` token 体系（`src/components/symbol/apple-workbench.css`）：

- 面板无边框、无圆角、无阴影（`border-radius: 0`）
- 通栏无缝分区

站点其他页面使用 `--foreground / --border / qt-panel` 的卡片语言（圆角 + 细边框 + 轻阴影）。

单页看是刻意的、克制的（Apple 工作台风格），但从 `/markets` 点进来会明显感觉"换了半个产品"。

**这不是 bug，是设计决策。** 但它应该被显式化：要么个股页作为"专业模式"在视觉上给出切换提示，要么把 `aw-*` 的表面语言向站点靠拢一个层级（保留无边框，但统一字号与强调色）。

### 5.2 字号偏小

报价条与右栏指标大量使用 11–12px。中文在 macOS 上渲染偏细，长时间盯盘疲劳感明显。

### 5.3 红绿与品牌色同屏

站点遵循中国习惯（红涨绿跌），但交互强调使用品牌蓝紫。深色模式下，K 线的红绿与强调色对比不足，视觉上"该抢眼的地方不抢眼"。

---

## 六、可访问性

### 做对的部分

- `role="tablist"` / `role="tab"` / `aria-selected` 在报价条、右栏、复盘 rail、新闻面板中均已实现
- `aria-label` 有 23 处通过 `t()` 本地化

### 缺的部分

| 问题 | 证据 | 影响 |
|---|---|---|
| tab 无方向键切换 | `symbol-quote-bar.tsx:144-158` 仅 `onClick`，无 `onKeyDown` | 键盘用户需 Tab 五六次才能过标签栏 |
| tab 缺 `aria-controls` / roving tabindex | 全文搜索无 `aria-controls` | 屏幕阅读器无法关联面板 |
| 分割条无法键盘调宽 | `symbol-page-client.tsx:344-350` 只有 `onPointerDown` | 键盘用户完全无法调整栏宽 |
| 7 处硬编码英文 aria-label | `"Close"` ×4、`"Resize side panel"`、`"Resize watchlist"`、`"fundamentals"` | 多语言站里的漏网之鱼 |

---

## 七、前端性能

### 做对的

1. **代码分包到位**：`symbol-page-dynamics.tsx` 把图表、自选列、dock 抽屉、AI 全部 `dynamic({ ssr: false })`，并各配了骨架屏
2. **轮询分层讲究**（`use-symbol-page.ts:129-144`）：有推送 60s / 降级 5s / 无价 5s，避免请求风暴
3. **依赖克制**：25 个依赖，图表用 `klinecharts` 而非 echarts
4. **React Query 缓存**：切回标签不重复拉取

### 核心问题：首屏只预取了 quote，没预取 K 线

服务端下发了 `initialQuote`，但 candles 必须等：JS 下载 → 水合 → 客户端 fetch → 渲染。于是"骨架屏 → K 线"之间有一段纯等待（本地 dev 环境 1–3 秒，生产环境取决于 RTT 与数据源延迟）。

**优化方向**：在 `page.tsx` 的 server component 中预取首批 candles（默认分辨率、固定 limit），通过 props 注水给 `SymbolChartSection`。这一项能直接消除首屏最大的一段空白。

### 次要问题

- 切到基本面时 `/api/earnings?scope=metrics` 与 `/api/earnings` 各拉一次（`use-symbol-tab-data.ts:175` 与 `:239`），存在重复请求
- 标签切换不保留滚动位置，从基本面切回图表再切回，阅读位置丢失

---

## 八、工程可维护性

- **优点**：11612 行拆成 40+ 文件，职责边界基本清晰（rail / tabs / chart / dock / plan / review 各自独立）
- **风险**：`symbol-page-client.tsx` 459 行同时承担布局、状态编排、事件分发、派生数据计算（`marketCap`、`quoteTabs`、`resolutionLabels`、`panelTab`、`closeDock`、`onSideSelect`），已经成为第二大脑。再往里加功能，改动成本会非线性上升
- **建议**：把「侧栏 icon 与面板的开关编排」抽成 `useWorkbenchPanels()`，把派生数据抽成 `useSymbolDerived()`

---

## 九、修复清单

| 优先级 | 事项 | 位置 | 预估 |
|---|---|---|---|
| **P0** | AI 按钮点击无面板、无提示 | `symbol-page-client.tsx` `onSideSelect` | 0.5 天 |
| **P0** | 无 Key 时给配置引导卡片，替代无限骨架屏 | `/api/quotes` 响应 + `symbol-rail-*` | 0.5 天 |
| **P1** | 首屏预取 candles 注水 | `page.tsx` + `symbol-chart-section.tsx` | 1 天 |
| **P1** | 报价条加实时 / 降级 / 断开状态点 | `symbol-quote-bar.tsx`（数据已在 hook） | 0.5 天 |
| **P1** | 图表叠加基准（vs 指数相对强弱） | `candle-chart-overlays.tsx` | 1 天 |
| **P2** | tab 方向键 + `aria-controls`；分割条键盘支持 | `symbol-quote-bar.tsx`、`symbol-page-client.tsx:344` | 0.5 天 |
| **P2** | 7 处硬编码 `aria-label` 走 `t()` | `src/components/symbol/*` | 0.5 天 |
| **P2** | 「计划」与「下单」入口统一 | `symbol-plan-panel.tsx` + 交易抽屉 | 1.5 天 |
| **P2** | 移动端触摸目标提到 44px | `symbol-quote-bar.tsx` | 0.5 天 |
| **P3** | 个股页字号与站点卡片语言对齐评审 | `apple-workbench.css` | 需设计决策 |
| **P3** | 拆 `symbol-page-client.tsx` | 新增两个 hook | 1 天 |
| **P3** | 设置页加「重新查看引导」 | `settings-about-panel.tsx` + tour | 0.5 天 |

---

## 十、结论

这张页面的**功能已经够用，问题在"信任感"和"第一分钟"**：

- 用户看不到数据是不是实时的（实时状态不可见）
- 用户不知道空白是没配 Key 还是坏了（空态缺失）
- 用户点了 AI 没反应（静默失败）

这三条修完，页面的观感会从"一个很卷的个人项目"变成"一个可以拿给专业用户看的工具"。功能层面唯一值得补的是**基准叠加**（个股 vs 指数相对强弱）——图表本身已有 MA/EMA/BOLL/RSI/MACD 与 6 种画线，不缺基础分析能力。

> 更正说明：初版报告误称"图表无指标、无画线工具"，经核实 `candle-chart-overlays.tsx` 与 `chart-drawing-icons.tsx` 均已实现，第三节已修正。
>
> 附：本次审查基于代码与本地实测，交易/计划/AI 的真实链路因缺少登录会话与行情凭证未端到端验证，相关结论已标注为静态审查。
