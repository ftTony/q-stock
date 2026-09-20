# Longbridge 网页交易端技术整理

整理对象：[https://trade.longbridge.com/](https://trade.longbridge.com/)。观察日期：2026-09-20。未登录会跳到 `longbridge.com/login?login-from=web-trade`，交易壳本身仍可从静态入口读到。

本文只写两类事实：

- **包内可见**：`trade.longbridge.com` 的网关 HTML，以及香港正式包 `https://assets.lbctrl.com/web/release-longbridge-trade/` 的模块名、WASM 导出和接口路径。
- **官方公开**：Longbridge 技术页与 OpenAPI 文档里写明的架构和协议。

没有在包或文档里出现的实现（尤其是内部熔断器、监控大盘的具体产品），不写成“他们就是这样做的”。

## 1. 结论

网页交易端不是独立的 Canvas/WebGL 应用，而是 **Electron 渲染进程同一套 Vue 代码编到浏览器**：

| 层 | 实际技术 | 证据 |
|---|---|---|
| 壳 | 多地区网关 + 灰度 | HTML 内 `entry-hk-base` / `entry-us-base` / `entry-hk-rc`，flag `webtrade_rc` |
| UI | Vue 3 + Vite 产物 | `type="module"`、`_plugin-vue_export-helper`、`*.vue_vue_type_script_setup_*` |
| 与桌面共用 | Electron `ipcRenderer` 在 Web 下降级为空实现 | `web-*.js` 抛出 `ipcRenderer sendTo not implemented for web`；源码路径前缀 `src/renderer/`；存在 `__WTT__`（Whale Trade Terminal） |
| 计算与连接 | Rust → WebAssembly（wasm-bindgen） | `engine_wasm_bg-*.wasm`，导出 `httpclient_*`、`wsclient_*`、`quoteutil_*` |
| 图表 | 自研 Classic（`lbChart`）+ TradingView | 枚举 `ChartMode.LBChart / TradingView`；官方页面写明联手 TradingView |
| 行情推送 | WASM WebSocket 客户端，按主题订阅 | `quoteKline`、`quoteDepth`、`quoteOrderBook`、`quoteTrade` 等 |
| 埋点 | 神策 Sensors Data | `sensorsdata@1.21.12` |

桌面端 Longbridge Pro 是另一条产品线：Rust + GPUI，官方组件库写明 GPU 绘制、120 FPS、虚拟表格。那不是这个网页的渲染器。网页里的 WebGL 出现在指纹采集和 `OffscreenCanvas` 工具代码里，**不能据此认为 K 线用 WebGL 绘制**。

首屏文案 `Downloading the component...` 只是 CSS 占位。真正下载的是 JS 模块和 WASM，不是 Flutter CanvasKit。

## 2. 加载与灰度

网关页约 24 KB，不直接跑交易逻辑。构建脚本 `scripts/inject-entry-urls.js` 把每个环境塞进 `<template>`，模板内容惰性，不会提前发请求。

决策顺序：

1. Cookie `app_id` / `app-id` 以 `longbridge_us` 开头则走美国，否则香港。
2. `?env=` 或 `localStorage` 可强制环境（QA）。
3. 否则请求 `POST {mApi}/api/forward/v1/featureflags`，香港 flag 为 `webtrade_rc`，`mApi` 为 `https://m.lbctrl.com`。
4. 超时默认 **800 ms**。超时、出错、游客未命中都回落到正式包，避免白屏。
5. 命中结果按会员 ID 和版本写入 `localStorage`，下次先用缓存，同时后台刷新。

香港正式入口（观察时）：

- `assets/index-*.js`：应用入口，日志 `init engine finished` 后动态加载 `initRenderer.ts`
- `assets/vendor-*.js`：Vue、WASM 胶水、部分第三方
- `assets/web-*.js`：Electron IPC 的 Web 空实现
- `assets/chunk-lang-*.js`：文案；key 里保留了源文件路径，因此能还原模块划分
- `assets/initRenderer-*.js`：主业务，体积约 1.7 MB，内部再拆 100 多个懒加载 chunk

这是前端发布上的降级：灰度接口挂了不影响交易页打开。

## 3. WebAssembly

引擎文件：`engine_wasm_bg-*.wasm`，由 wasm-bindgen 导出，初始化日志为 `init engine finished`。它承担网络和行情计算，不负责画 K 线。

可见导出分三组。

**HTTP**

`httpclient_new / get / post / put / delete / getFile / request`，以及 `setURL`、`setHeader`、`getSession`、`setSession`、`renewToken`、`renewTradeToken`、`rotateBeacon`、`updateBeacon`。

交易令牌和普通登录令牌分开续期。Beacon 轮换用于埋点或设备标识，不在页面 JS 里手写签名。

**WebSocket**

`wsclient_new / setURL / subscribe / subscribeV2 / unsubscribe / unsubscribeV2 / resubscribe / reconnect / close / readyState`。

按业务拆开的拉流方法：

| 导出 | 用途 |
|---|---|
| `quoteList` / `userQuote` | 行情列表、自选 |
| `quoteDetail` | 个股详情 |
| `quoteDepth` / `quoteOrderBook` | 深度、盘口 |
| `quoteTrade` | 逐笔 |
| `quoteKline` | K 线 |
| `quoteMinute` / `quoteMultiMinute` | 分时、多日分时 |
| `optionList` | 期权链 |

断线后有显式 `reconnect` 和 `resubscribe`，不是只靠浏览器默认重连。

**行情数值**

`quoteutil_*`：涨跌额、涨跌幅、振幅、换手、市值、市盈率、N 日涨幅、价格精度、交易状态文案。热路径放在 WASM，避免在 Vue 响应式里对全表做浮点格式化。

## 4. WebGL、Canvas 和高频渲染

包里能确认的绘制相关代码：

- **Canvas 2D + WebGL 能力检测**：指纹脚本创建 2000×200 的 canvas，走 `getContext("2d")`，并用 `WebGLRenderingContext` 判断是否支持 WebGL。这是设备指纹，不是行情图。
- **OffscreenCanvas**：vendor 里有把 bitmap 画到离屏 canvas 再导出的 worker。常见于截图或回放，不能当成 K 线引擎。
- **Lottie**：矢量动画，用于动效，不是报价。
- **图表双模式**：`ChartMode = lbChart | tradingView`，`ChartType = dcline | kline`。自研模块目录是 `lbchart/lbcharts`（画线、指标、统计、筹码 `chartcyq`、历史分时）。TradingView 有独立 datafeed：`lbchart/tradingview/utils/datafeed`。官方交易平台页写明与 TradingView 的划线工具合作。TradingView Charting Library 的主路径是 Canvas 2D。

高频行情不靠“每条推送触发一次 Vue 重绘”，包里能对上的做法是：

1. **推送进 WASM WebSocket**，JS 只拿已经按主题拆好的结构。
2. **增量字段**。OpenAPI 的 `PushQuote` 写明“只有变化的字段才会填充”，并带 `sequence`。网页包解析报价时读取 `last_done`、`timestamp`、`prev_close`、`sequence`。
3. **命令令牌桶**，避免订阅风暴打满主线程和网关。见下一节 `WSCmdScheduler`。
4. **智能聚合在服务端**。官方行情说明：内部用可靠 UDP 和私有二进制协议，推送前做智能聚合，处理延迟小于 1 ms，美股到客户端小于 100 ms，港股客户端小于 35 ms。浏览器侧看到的是聚合后的 WebSocket 消息，不是交易所原始逐笔全量直推。
5. **行情权限降级**。建连成功后若处于降级，状态机为 `downgraded / takingOver / normal`。对应接口 `POST /v1/quote/device/online`、`POST /v1/quote/device/switch`。同一行情权限被另一台设备占用时，当前页降级而不是把连接打爆。

K 线历史不走推送全量：`GET /v3/quote/kline`、`GET /v1/quote/stocks/klines`。分时走 `/v5/quote/stock/timeshares`、`/quote/stock/mutitimeshares`、`/v1/quote/stock/history_timeshares`。盘口快照走 `/v1/quote/stock/orderbook`，逐笔走 `/v1/quote/trades`。实时更新再叠加 `wsclient_quoteKline` 等推送。

## 5. 复杂表格

自研组件目录（从语言包 key 还原，约 72 个业务目录）里和表格直接相关的有：

- `lbwatchlist`：自选，含 `watchstockstable`、`sparkline`
- `lbquotelist`：行情列表
- `lborderbook`、`lborderandbrokers`：盘口、经纪队列
- `lborder`、`lbdesktradingrecord`、`lbmanualtraderecord`：订单与成交
- `lbticker`：逐笔
- `lboptionchain`：期权链
- `lbtreemaps`：热力/树图

懒加载 chunk 有 `tableConfig`、`useTableUtils`。语言包里的 key 命名到 `watchstockstable_2099` 这类行号，说明表格列和单元格文案是按业务表拆开的，不是一个通用 Excel。

官方 **桌面** GPUI 组件写明虚拟滚动可到数十万行。网页包这次扫描没有看到 `vue-virtual-scroller` / `vxe-table` 的库名；表格性能更多依赖 WASM 格式化、推送增量，以及下面的订阅限流。不要把桌面虚拟表格的数字安到网页上。

## 6. K 线交互

Classic（`lbChart`）从目录能看出的交互：

- 主图类型：实心/空心 K 线、美国线、折线、面积、平均 K（Heikin-Ashi）；语言包有对应文案
- 副图与指标：`indicatorselector`、`indicatorsetting`、`indicatordesc`
- 画线：`drawtoolbar`、`usedrawline`、`drawingfloatbar`
- 叠加：成本线、买卖点（`BSPointOrder`）、公司行动
- 筹码：`chartcyq`
- 区间统计：`statisticspanel`
- 图上交易：`charttrader`、`ordercontrol`、`chartTradeProvider`
- 分时：`historytimesharingchart`，以及 `DCLine`

TradingView 模式单独一套 datafeed 和标记（`tv/marks`）。语言包写明：TradingView 模式不画止盈止损线，要切回 Classic。两套图不是简单换肤，交易覆盖层只做在自研图上。

官方行情页还公开：主图/副图 50 个以上指标、分红与财报打在 K 线上、持仓成本和买卖点、全屏看盘。这些和上面的模块对得上。

## 7. 前端性能：订阅令牌桶

`initRenderer` 里有 `WSCmdScheduler`，专管 WebSocket 命令，不是 HTTP 接口限流。

默认参数：

- `STEADY_RATE = 15`（每秒稳定放行 15 个命令）
- `BUCKET_CAPACITY = 100`（突发容量）

补桶公式：

```text
tokens = min(capacity, tokens + elapsedMs * steadyRate / 1000)
```

行为：

- `schedule(fn)` 把发送动作放进队列，返回 Promise。
- `drain` 时每个任务消耗 1 个 token；token 不足就停，并打日志“限流队列介入”。
- 任务可 `isCancelled`。切股票、关掉面板时 `clear()` 会作废队列里还没发出去的命令，错误文案是 `ws cmd cancelled before send`。
- 排空后记录本轮排队峰值 `queuedPeak`。

这解决的是“快速切换自选 / 多图同时订阅”把订阅、退订打成突发流量。画面上的卡顿和网关侧的订阅风暴一起被压住。它和 OpenAPI 的 HTTP 令牌桶是两套限制。

其他能看到的性能点：

- 业务 chunk 懒加载（订单、图表、网格交易、表格配置都是独立文件）。
- 行情数值在 WASM 里算完再进界面。
- 布局恢复用 `requestIdleCallback`，超时 1 秒，避免和首屏抢主线程。
- 灰度请求 800 ms 超时，不阻塞注入正式包。

## 8. 限流、降级、熔断

### 8.1 客户端限流（包内可见）

`WSCmdScheduler`：15 次/秒、桶容量 100，只包住 WS 命令。

### 8.2 行情降级（包内可见）

`QuoteLevelDowngradeStatus`：`downgraded`、`takingOver`、`normal`。日志原文是“ws 建连成功后，处于降级状态”。组件目录有 `lbquoteleveldowngrade`。设备占用通过 `/v1/quote/device/online` 和 `/v1/quote/device/switch` 切换。

这是权限和会话降级：另一台设备拿走高级行情时，当前端降到可展示的级别并提示，而不是无限重试订阅。

发布降级是另一回事：灰度 flag 失败则用 `hk-base` / `us-base`。

### 8.3 OpenAPI 限流（官方文档）

OpenAPI 使用令牌桶：1 秒不超过 10 次，并发不超过 5。行情订阅超限返回业务码 `301606`（限流），订阅数超限为 `301605`。每次最多 500 个标的，同时在订也不超过 500。同一标的的多种行情只占 1 个订阅额度。

网页交易端走的是自有 `/v3/orders/submit` 等接口，数值不必和 OpenAPI 的 10 次/秒相同。OpenAPI 的桶是对外程序化接口的公开契约。

### 8.4 熔断

本次在交易包和官方技术页里都没有看到名为熔断器的实现或阈值。官方写的是另一组能力：

- 云原生、异地多活、全内存订单系统
- 无状态水平扩展，计算与存储分离
- 自动故障转移，极端行情秒级扩容
- 内存数据可快速恢复；回收使用时间轮
- 下单平均 28 ms、最快 10 ms；单配置单元约 20,000 笔/秒（公开报道里也出现过平均 18 ms）
- 前台风控约 5 ms

这些是容量和故障转移，不是“错误率到了就打开熔断器”的客户端库。网页侧真正做掉的失败保护，是订阅队列作废、灰度超时回落、行情权限降级。

## 9. 告警、监控和风控大盘

零售网页能确认的“告警”是通知中心组件 `lbnotificationcenter`，以及神策埋点（点击、单页、beacon 发送）。错误 toast 会带上 `trace_id` 和 `api_url`，方便对日志。

同一套渲染进程还编进了 **WTT / 机构柜台** 的风控接口。零售页面不一定展示，但说明监控数据已经有 API，而不是临时查库：

| 接口 | 作用 |
|---|---|
| `POST /v1/risk_gateway/client/risk_metrics` | 客户风险指标 |
| `POST /v1/risk_monitoring/query_frequency_by_account_channel` | 按账户渠道查频率 |
| `GET/POST /v1/risk_monitoring/wtt/*` | 保证金追缴、强平、消息推送、跟进记录 |
| `POST /v2/risk_monitoring/wtt/force_close` | 强平 |
| `POST /v1/risk_monitoring/wtt_cancel_order` | 风控撤单 |
| `POST /v1/orders/price_protection_check` | 价格保护校验 |

官方风控描述与此一致：统一购买力、融资欠款、应追缴保证金实时可见，前台交易和出入金风控约 5 ms。内部监控大盘的具体产品（Grafana 或自研）没有出现在这个前端包里。对外能对齐的指标是技术页上的下单延迟、订单吞吐、行情处理延迟和客户端行情延迟。

## 10. 补偿、幂等、防重复下单和撤单

### 10.1 行情补偿（协议公开 + 客户端重连可见）

- 推送带 `sequence`。官方 `PushQuote.sequence` 为 int64。缺口检测后应重拉快照再订，而不是把跳号的增量直接画上去。
- `tag`：`0` 实时，`1` 收盘后修正。修正包用来覆盖盘中临时值。
- 客户端有 `wsclient_reconnect` 和 `wsclient_resubscribe`。重连后重新订阅，避免静默丢流。
- 官方传输：私有二进制（OpenAPI 为 BigEndian + Protobuf body）、增量字段、服务端智能聚合。浏览器 WASM 引擎是否使用同一套二进制帧，胶水层没有把 protobuf 字符串留在 JS 里；HTTP 行情仍是 JSON 风格的 REST（`/v3/quote/kline` 等）。

内部“可靠 UDP”在数据源到长连接网关之间，不到浏览器。浏览器只有 WebSocket。

### 10.2 订单补偿（WTT 包内可见）

这些接口在共享包里，审计头指向 WTT 菜单，属于柜台/补单，不是零售下单按钮：

- `POST /v1/tube/replenishment_order`：补单；组件目录 `lbreplenishment`
- `POST /v1/tube/exceptional_order`：异常单
- `GET /v1/orders/fix_status`：方法名 `getFixStatus`。这里的 FIX 按券商语境应是 FIX 会话状态查询，不是“把数据修复一遍”
- `POST /v1/tob/orders/ems_takeover`：EMS 接管
- `POST /v1/trade-capture-report/deal|ack|semiauto`：成交回报补录

订单状态以服务端为准。客户端补偿是补单、异常单和成交回报，不是在浏览器里重放本地队列。

### 10.3 下单幂等（OpenAPI 公开）

OpenAPI `POST` 下单支持 `client_request_id`：

- 服务端缓存 10 分钟
- 窗口内相同 ID 返回第一次的响应，不新建订单
- 不传则每次都可能新单，重试会重复下单
- SDK 注释要求调用方自己生成唯一值（UUID）

网页主包里下单路径是 `POST /v3/orders/submit`（期权等走 `/v2/stock_contract/submit`），撤单是 `POST /v2/orders/withdraw`，附加单撤单是 `POST /v1/attached_order/cancel`。主包字符串里没有 `client_request_id`。零售网页是否另有幂等字段，这次没有在懒加载 chunk 里逐个证实。程序化交易要以 OpenAPI 的 `client_request_id` 为准。

防重复下单在这种设计里分两层：

1. **点击层**：按钮进入提交中后禁用，请求返回前不再组包。主包没有留下一个叫 `submitting` 的全局锁，这层要看具体下单组件。
2. **服务端层**：同一 `client_request_id` 在 10 分钟内只成交一次创建。超时、断网、用户连点，都靠这个 ID，而不是靠“请求体长得一样”。

### 10.4 重复撤单

网页撤单以订单号为键：

- 单笔：`POST /v2/orders/withdraw`，body 带 `order_id` / `order_id_str`
- 批量：`POST /v1/orders/batch_withdraw`、`POST /v1/orders/batch_trade_cancel`
- 附加单：`POST /v1/attached_order/cancel`
- 机构：`POST /v1/tob/orders/ocg_mass_cancel`（港交所 OCG 批量撤）

撤单天然按 `order_id` 幂等：订单已撤或已成，再次撤应返回当前状态，不能再产生一笔新的反向单。OpenAPI 撤单文档只要求 `order_id`，没有第二套 `client_request_id`。客户端仍应在飞行中禁用撤单按钮，避免把同一 `order_id` 打出一串在途请求；真正挡住重复效果的是服务端按订单状态机拒绝“已终态再撤”。

官方订单系统还有一层业务闸门：多市场阶段控制，按时段放行下单、改单、撤单。时段不对时直接拒绝，不进入撮合。

## 11. 和公开后端架构怎么拼在一起

```text
交易所 / 行情源
    │  可靠 UDP、私有二进制、增量、智能聚合
    ▼
长连接网关 ──秒级扩容──► 全内存行情
    │ WebSocket
    ▼
浏览器 WASM wsclient / httpclient
    │ 令牌桶 15/s、桶 100；sequence；权限降级
    ▼
Vue 3 表格 / lbChart 或 TradingView

下单：Vue → POST /v3/orders/submit
         → 内存订单系统（无状态计算 + 存储分离，时间轮回收）
         → 阶段控制、条件单、约 5 ms 风控
撤单：POST /v2/orders/withdraw（按 order_id）
程序化：OpenAPI client_request_id，10 分钟幂等；HTTP 令牌桶 10 次/秒、并发 5
```

## 12. 源码模块地图（网页包）

业务目录前缀均为 `src/renderer/business/components/`：

`lbchart`、`lbwatchlist`、`lbquotelist`、`lborderbook`、`lbticker`、`lbtrade`、`lborder`、`lboptionchain`、`lboptionchart`、`lbgridtrade`、`lbladdertrading`、`lbbaskettrade`、`lbstopprofitandstoploss`、`lbquoteleveldowngrade`、`lbnotificationcenter`、`lbreplenishment`、`lbminiquote`、`lbmarketvolatility`、`lbtreemaps`。

图表子目录：`lbcharts`（画线、指标、统计）、`tradingview`（datafeed）、`charttrader`（图上交易）。

## 13. 这类页面对前端的挑战

专业交易页不是普通中后台：同一视口里要同时扛高频推送、大表、可交互 K 线、下单撤单，还要和桌面端、多市场、多权限共存。结合上文可见实现，前端要处理的问题大致落在下面几类。

### 13.1 挑战总览

| 挑战 | 典型症状 | 必须处理的问题 |
|---|---|---|
| 首屏与包体 | 白屏十秒、WASM 下载失败 | 壳与业务分离、灰度超时回落、关键路径懒加载 |
| 主线程争用 | 滚动卡、输入延迟、图表掉帧 | 热路径出 JS、订阅限流、渲染节流、空闲时再做布局 |
| 推送一致性 | 价格跳号、盘口错位、重连后脏数据 | sequence、快照补偿、退订/再订、增量合并规则 |
| 大表与多面板 | 自选几百行一卡、切换面板泄漏订阅 | 虚拟化或按需渲染、订阅生命周期、表格与推送解耦 |
| K 线交互 | 缩放卡顿、指标拖垮、图上交易错位 | Canvas 与 DOM 分层、历史分页、双图模式差异、覆盖层坐标 |
| 交易正确性 | 连点双单、超时重试乱单、撤单风暴 | 飞行中锁、幂等 ID、按 `order_id` 状态机、时段闸门 |
| 权限与设备 | 高级行情突然变慢、多端互踢 | 降级状态机、设备占用切换、降级后的 UI 提示 |
| 多端同构 | Web 缺 IPC、桌面有快捷键与音效 | 能力探测、空实现、条件编译或适配层 |
| 多市场时区 | 盘前盘后按钮错、清算时间混乱 | 市场阶段控制、时区表、交易日与夜盘开关 |
| 可观测与灰度 | 线上偶现无法复现、灰度翻车 | `trace_id`、埋点、feature flag 短超时、正式包兜底 |
| 安全与合规 | 误操作、敏感信息、审计缺失 | 二次确认、交易密码/TFA、审计头、右键与截图策略 |

### 13.2 启动与交付

- **首包太大**：交易页常有 MB 级 JS + WASM。壳页只做地区与灰度，业务用动态 `import`；图表、网格交易、表格配置等必须懒加载。
- **灰度不能拖垮打开**：feature flag 要短超时（观察值为 800 ms），失败一律正式包，并缓存命中结果，避免每次打开都赌接口。
- **WASM MIME / CDN**：引擎必须按 `application/wasm` 下发；缓存策略要和版本 hash 对齐，否则用户会卡在半旧半新。
- **Electron 与 Web 同构**：桌面有 `ipcRenderer`、系统音效、多窗；Web 要同一套 UI 编译过去，缺能力时降级为空实现，而不是 `undefined` 炸掉。

### 13.3 高频行情与主线程

这是最大的前端压力源。推送可以到每秒数十到数百条（视订阅数与聚合策略），若每条都触发 Vue 全量响应式更新，表格和图表会一起掉帧。

必须处理：

1. **推送与渲染解耦**：网络线程/WASM 收包 → 合并到本地 store → `requestAnimationFrame` 或固定帧率刷 UI，而不是“一包一绘”。
2. **订阅风暴**：快速切股票会连发 subscribe/unsubscribe。用命令队列 + 令牌桶（观察值约 15/s、桶 100），切页时作废未发出命令。
3. **增量合并**：只更新变化字段；用 `sequence` 发现缺口后拉快照，禁止把乱序增量硬画上去。
4. **收盘修正**：区分实时包与修正包（如 `tag`），修正要覆盖盘中临时值，不能当新 tick 追加。
5. **热计算下沉**：涨跌幅、市值、精度、状态文案放 WASM/Worker，避免在表格单元格渲染函数里反复 `toFixed`。
6. **可见性**：面板隐藏、标签页后台时降频或暂停非关键订阅，回来再 `resubscribe`。

### 13.4 复杂表格

自选、盘口、逐笔、订单、期权链往往同时存在，列多、行多、单元格还要跟着报价闪色。

必须处理：

- **只渲染可视区**：虚拟滚动或窗口化；固定列、排序、多选不能破坏虚拟窗口的索引映射。
- **单元格更新粒度**：整表 `data = newData` 会毁掉性能；按 `symbol` / `order_id` 做点更新，或对行做浅比较。
- **闪色与动画预算**：涨跌高亮要有上限（例如每行每秒最多闪一次），否则 GPU 和样式计算被拖死。
- **订阅与行集合绑定**：表格里出现的标的才订阅；过滤、分页、销毁组件时必须退订，否则连接与内存泄漏。
- **列配置持久化**：用户改列宽、排序、布局后要可恢复，且与多视图/多账户不串数据。

### 13.5 K 线与图上交易

K 线是交互密度最高的模块：缩放、十字线、画线、指标、公司行动、成本线、买卖点，还可能叠下单控件。

必须处理：

- **历史与实时两通道**：历史 REST 分页/分段加载；实时只更新最后一根或追加；周期切换要取消 inflight 请求，防止旧周期数据覆盖新周期。
- **交互与行情抢主线程**：拖拽、缩放期间可暂缓次要指标计算；长指标链要可配置关闭。
- **坐标与覆盖层**：DOM 下单条、止盈止损线要跟 Y 轴缩放同步；TradingView 与自研图能力不一致时（例如 TV 不画止盈止损）必须产品层说清，不能 silently 丢。
- **图上交易的状态**：从图表点价带入下单面板时，要校验交易时段、最小价差、lot size，失败要可回滚选价。
- **内存**：长时间挂着日 K + 多副图，要注意历史缓存上限和离屏 canvas 回收。

### 13.6 下单、撤单与状态机

交易正确性优先于“点得爽”。前端既要防呆，又不能替服务端做最终裁决。

必须处理：

| 问题 | 前端职责 | 服务端职责（前端依赖） |
|---|---|---|
| 连点下单 | 提交中禁用按钮；一次点击只发一请求 | `client_request_id` 等幂等键，窗口内去重 |
| 超时重试 | 重试用同一幂等键；不要换 ID 再发 | 缓存首次响应 |
| 重复撤单 | 飞行中锁；终态订单隐藏/禁用撤 | 按 `order_id` + 状态机拒绝已撤/已成 |
| 改单竞态 | 本地乐观更新可回滚；以推送/详单为准 | 版本或状态校验 |
| 时段错误 | 按钮灰显 + 文案；仍可能被拒 | 多市场阶段控制 |
| 弱网乱序 | 以服务端订单状态推送为准，本地队列不作权威 | 订单变更 WS |

另外：批量撤、附加单、条件单、止盈止损各自有独立接口与确认流，不能共用一个“下单”对话框状态。

### 13.7 连接、权限与多设备

- **断线重连**：指数退避 + 上限；重连后鉴权、再订阅；重连期间 UI 显示“行情延迟/重连中”，避免用户以为价格还在更新。
- **行情权限降级**：另一设备抢走 Level-2 时，状态要从 `normal` 切到 `downgraded`/`takingOver`，列表与盘口要立刻换成降级后的字段集，并给出切换设备入口。
- **登录与交易令牌分离**：交易 token 续期失败时，应只拦交易，尽量保留看盘；续期成功后再恢复下单。
- **多账户/多主体**：切换 aaid、市场、币种时，清空或隔离订单、持仓、购买力缓存，防止串户展示。

### 13.8 布局、多市场与体验细节

- **可拖拽多面板**：布局序列化、冲突恢复、`requestIdleCallback` 延迟恢复，避免和首屏抢 CPU。
- **时区与交易日**：美股夜盘、港股竞价、A 股集合竞价规则不同；时钟组件、倒计时、是否可下单必须跟市场绑定。
- **精度与展示**：不同市场价差、手数、货币小数位不同；展示精度与下单精度要分开校验。
- **无障碍与快捷键**：交易员依赖键盘；Web 要处理浏览器默认快捷键冲突，桌面端还要和系统级快捷键分层。
- **音效与通知**：成交、预警在 Web 受自动播放策略限制；需用户手势后解锁，并提供静音开关。

### 13.9 工程与协作成本

这类页面把前端工作从“写页面”拉成“写实时系统客户端”：

1. **状态模型复杂**：行情 store、订单 store、权限 store、布局 store 交叉；需要明确单一数据源，避免图表和表格各持一份互相覆盖的报价。
2. **测试难**：要有 mock 推送、乱序 sequence、断线、限流、权限降级、重复提交的夹具；单靠点选 E2E 不够。
3. **性能基线**：自选 N 行、盘口深度、1s 内 tick 数、主线程 long task，都要有可回归的指标，否则功能迭代会悄悄把帧率打穿。
4. **包体与版本**：WASM、图表库、语言包体积大；需要按地区/白标拆包（观察中有 US/HK 与 whitelabel CSS），并处理旧客户端缓存。
5. **安全边界**：前端防呆不能代替风控；密钥不下发到浏览器；审计字段（菜单来源等）要随请求带上，便于事后追责。
6. **产品与技术边界**：哪些在客户端聚合、哪些必须服务端聚合（智能推送、权限、清算阶段）要事先定清楚，否则前端会做出无法保证正确的“聪明逻辑”。

### 13.10 建议的问题清单（落地时逐项验收）

打开类交易页前，前端至少能回答下面这些问题：

1. 首屏可交互时间与 WASM 失败时的降级路径是什么？
2. 单标的与百标的订阅时，主线程 long task 是否可控？
3. 推送丢包、乱序、重连后，价格与盘口如何自愈？
4. 切股票 1 秒内连点，订阅命令是否被限流且旧命令被取消？
5. 表格滚动与报价闪色是否仍保持可交互帧率？
6. K 线缩放、改周期、图上改价是否与 inflight 请求互相踩踏？
7. 下单超时重试会不会变成两笔？撤单连点会不会打出一串在途请求？
8. 行情被其他设备占用时，UI 如何降级且可恢复？
9. 交易时段外、购买力不足、价差不合法时，拦截发生在哪一层？
10. 线上一个失败请求能否用 `trace_id` 从网关追到订单系统？

## 参考

- 网页壳：`https://trade.longbridge.com/index.html`（SPA 回退，同一份网关 HTML）
- 香港正式静态资源：`https://assets.lbctrl.com/web/release-longbridge-trade/assets/`
- [Longbridge 技术页](https://longbridge.com/hk/zh-CN/tech)
- [行情服务](https://longbridge.com/hk/zh-CN/quotation-service)
- [交易平台 / Web Trade](https://longbridge.com/hk/zh-CN/trading-platforms)
- [OpenAPI 二进制协议](https://open.longbridge.com/zh-CN/docs/socket/protocol/overview)
- [行情推送](https://open.longbridge.com/zh-CN/docs/quote/push/quote)
- [订阅与限流错误码](https://open.longbridge.com/zh-CN/docs/quote/subscribe/subscribe)
- [OpenAPI 下单与 client_request_id](https://open.longbridge.com/zh-CN/docs/trade/order/submit)
- [OpenAPI 撤单](https://open.longbridge.com/zh-CN/docs/trade/order/withdraw)
- [令牌桶限频说明](https://open.longbridge.com/zh-CN/docs/qa/broker)
- 桌面 GPU UI（对照，不是网页渲染器）：[GPUI Component](https://longbridge.github.io/gpui-component/zh-CN/)
