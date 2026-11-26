# 个股页面模块边界与状态拆分设计

## 背景与意图

个股页面当前由 `SymbolPageClient` 编排数据、布局、标签页、Dock、交易、AI、SEO
和移动端状态，相关工作台实现已超过 26,000 行。部分状态同时存在于多个 Hook、
组件属性和回调中，导航切换、面板互斥和页面重置容易产生分散逻辑。

目标是建立清晰的页面状态边界，使工作台行为可定位、可测试，并降低
`SymbolPageClient` 和 `SymbolWorkbenchBody` 的编排复杂度。

## Approaches

1. **中央状态重构（采用）**：使用 Zustand 建立个股页面工作台 store，
   集中管理页面身份、布局偏好、标签页、Dock、抽屉、聚焦和移动端状态。
   React Query 和现有领域 Hook 继续负责服务器数据、行情、用户操作和缓存。
2. **增量 Hook 拆分**：保留组件外部状态，按领域拆分 Hook。
   优点是迁移成本低；缺点是面板互斥和跨区域聚焦仍会散落在回调中。
3. **一次性工作台重写**：重做路由装配、布局组件和状态模型。
   优点是边界最干净；缺点是交互回归风险和迁移周期都明显过高。

采用方案一，并保留方案二的渐进迁移方式，不进行一次性重写。

## Goals

- 用一个可订阅、可测试的 store 描述跨组件的个股工作台状态。
- 把 `SymbolPageClient` 从面板互斥逻辑中解放为路由级装配和适配层。
- 保持桌面 side/stack、移动端、交易、复盘、AI、SEO 和自选股行为不变。
- 保持实时行情、标签页数据和 mutation 的现有 React Query 机制。
- 支持切换个股或资产类型时原子重置页面工作台状态。

## Non-goals

- 不迁移全部业务数据到 Zustand。
- 不重写 CandleChart、订单接口、新闻、期权等领域组件。
- 不重构路由的 SSR/SEO 数据获取。
- 不引入新的路由状态框架或全局应用状态容器。
- 不追求一次性把所有文件降到任意行数阈值。

## Constraints

- 项目已使用 Zustand，store 应沿用现有 `create` 和 selector 用法。
- 页面状态必须按 `assetType + symbol` 隔离，避免导航后旧面板残留。
- 布局偏好仍持久化到 `qstock.symbolLayout.v2`，并兼容现有独立旧 key。
- 实时行情节流和图表不重渲染约束必须保留。
- 桌面和移动端仍共享同一套 panel action，避免维护两套互斥规则。

## 状态边界

### Zustand 管理

新建 `src/stores/symbol-workbench-store.ts`，拆为以下逻辑切片：

- `identity`：当前 symbol、assetType 和重置序号。
- `layout`：layout mode、模块可见性和持久化偏好。
- `navigation`：stack tab、news feed tab、移动端 segment 和更多标签页。
- `surface`：AI、SEO、Dock、交易票面、移动端计划抽屉的打开状态。
- `focus`：计划、复盘、订单高亮和绑定策略信息。
- `resize`：保留现有 resize Hook 或将纯尺寸状态迁入 store，首阶段以布局 Hook 为准。

Store 暂不持有：

- Quote、K线、新闻、评论、财务、研报等接口数据。
- React Query session、watchlist、订单和 mutation 结果。
- DOM ref、测量值、requestAnimationFrame、resize pointer session 等瞬时实例细节。

### React Query / 领域 Hook 保持

- `useSymbolPage` 保持数据组合入口，但只向 store 提供当前导航输入与操作回调。
- `useSymbolCandles`、`useSymbolTabData`、`useSymbolPageMutations`继续管理各自领域。
- `useSymbolLayoutPrefs`首阶段可成为 store 的持久化适配器，迁移完成后移除重复 `useState`。
- `useSymbolWorkbenchPanels`首阶段拆成纯动作函数或适配 Hook，最终由 store action 替代。

## 模块边界

目标组件职责：

- `SymbolPageClient`：构造页面身份、连接领域数据、组合布局 props、处理页面级副作用。
- `SymbolWorkbenchBody`：纯工作台布局与渲染，接收已收敛的数据和 action。
- `SymbolWorkbenchMainGrid`：桌面/移动端中心网格及直接区域装配。
- `SymbolPageOverlays`：Dock、AI、SEO 和移动端抽屉渲染。
- `symbol-workbench-store`：跨区域的页面工作台状态和互斥动作。
- `symbol-*` domains：各自保留数据查询、面板数据和局部交互。

## 核心迁移规则

- 先迁移状态最集中且互斥关系最明确的面板：Dock、AI、SEO、移动计划、交易票面。
- 布局偏好迁移后保留现有 localStorage key 和首屏 hydration 行为。
- 页面切换时先提交 identity reset，再依次清理 surface、focus 和导航状态。
- 每个 store action 必须自包含互斥规则，不再由多个组件重复实现。
- 组件只订阅所需 selector，避免行情或布局更新导致无关面板重渲染。
- 不把 `useSymbolPage` 返回的大对象一次性塞进 store；继续用 Hook 组装领域数据。

## 验证与回归

- 保留现有 side/stack 布局切换。
- 验证桌面 Dock：新闻、交易、评论；移动端底部和抽屉行为。
- 验证 AI、计划、复盘、SEO 面板互斥打开和关闭。
- 验证切换 symbol/assetType 后，旧面板、聚焦和绑定策略不会残留。
- 验证刷新、暗色/亮色、watchlist/rail 展开状态和布局持久化。
- 最小验证为目标测试、`typecheck` 和相关 `lint`；完整构建作为阶段性验收。

## 完成标准

- `SymbolPageClient` 不再直接拥有 Dock、AI、SEO、交易票面等互斥 `useState`。
- `SymbolWorkbenchBody` 不再接收跨多个面板重复传递的状态回调。
- 所有跨区域打开/关闭 action 来自同一个 store action 集。
- 切换个股不会泄漏上一只股票的工作台状态。
- 现有数据查询、实时行情和图表渲染行为保持兼容。
