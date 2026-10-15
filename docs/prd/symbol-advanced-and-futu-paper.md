# 个股高级盘口 + 富途模拟交易 — 产品/技术规划

> 状态：**规划稿**（未开工实现）  
> 范围：美股 / 港股个股增强；模拟交易迁到富途 OpenAPI `sim-trade`  
> 约束：生产 **1GB / 1 核**；不造假行情；真券商实盘仍后置  
> UI 改版：[个股专业交易台 UI](./symbol-trading-ui.md)  
> 相关：[行情与本地模拟交易现状](../market-trading-tech.md) · [L2 营销页](../product-roadmap.md) · [金融图表技术](../financial-chart-tech.md)

---

## 0. 决策摘要

| 项 | 决定 |
|---|---|
| 高级行情权限 | **平台**长桥/富途高级行情（env 开关）；未授权 → 说明 + 链 `/advanced-quotes` |
| 订单流 | **盘口深度 + 分笔成交** |
| 筹码 | **Volume Profile**（由 OHLCV 本地估算），非 A 股券商筹码专有接口 |
| 适用市场 | 仅 `stock`（美股）、`hk`（港股）；`cn` / `crypto` / 指数不做 |
| 模拟交易 | 对接 **富途云端 REST 模拟交易**（`/api/v1.0/sim-trade/...`），逐步替代本地 Prisma 撮合为主路径 |
| 实盘 | 仍不做；`BrokerGateway` 实盘接口后置 |

---

## 1. 个股页：分时 · 订单流 · 资金 · 卖空 · 筹码

### 1.1 现状

- 图表周期仅 `D | Q | Y`；[`/api/candles`](../../src/app/api/candles/route.ts) 无分钟线
- 长桥报价仅用 `depth` 取买一卖一，无完整盘口/分笔 UI
- Tabs：新闻、财报、简介、评论、AI 等；无资金/卖空/筹码
- `/advanced-quotes` 已有 L2 产品叙事与示意，未接真数据

### 1.2 信息架构

```text
SymbolHeader
    ↓
Chart 工具条：分时(1m) | [5m?] | 日 | 季 | 年
Candle / 分时折线
    ↓
US/HK 且有权：左盘口 Depth | 右分笔 Time&Sales（小屏 Tab 化）
无权限：占位说明 → /advanced-quotes
    ↓
Tabs（US/HK 增）：资金 | 卖空 | 筹码(VP) | …原有 tabs
```

### 1.3 能力 × 数据源

| 能力 | 主源 | 降级 |
|---|---|---|
| 分时 1m（可选 5m） | 长桥/富途分钟 K；Finnhub 1m 作美股兜底 | 空图 + 文案 |
| 盘口 Depth | 长桥 `depth` / 富途盘口（需高级权限） | 锁定 UI，不轮询 |
| 分笔 Trades | 长桥/富途成交明细 | 同上 |
| 资金分布 | 券商资金流向类接口（有则接） | Tab「暂无数据」 |
| 卖空 | 港股：券商/交易所卖空字段；美股：Finnhub short interest（延迟） | 暂无数据 |
| 筹码 VP | **本地**：当日分时或近 N 根日 K → 价位桶成交量 + POC/VAL/VAH | 数据不足时提示 |

### 1.4 权限

- `ADVANCED_QUOTES_ENABLED=true`：表示平台 Key **已开通**深度/分笔
- `canUseAdvancedQuotes()`：env 开 **且** 解析到平台长桥或富途凭证
- `GET /api/market/depth`、`/api/market/trades`：无权限 → `403 ADVANCED_QUOTES_REQUIRED`
- **不做**用户 BYOK 单独开 L2（本期）；不做假盘口

### 1.5 1G 主机约束

- 盘口/分笔：**仅组件可见时**轮询（默认 3–5s）；切走即停
- 单次 depth ≤ 10 档；trades ≤ 50 条；分钟线单次 ≤ 500 根
- 禁止 SSR 拉 L2；全部 `cachedFetch` + 短 TTL
- 资金/卖空低频（5–60min 缓存）

### 1.6 实施切片（个股）

1. 分时：扩展 `CandleResolution` + candles API + 图切换  
2. 权限门闩 + 盘口 + 分笔  
3. 筹码 VP 面板  
4. 资金 / 卖空面板  
5. 更新 `.env.example` 与本文件验收

### 1.7 验收（个股）

- [ ] US/HK 可切分时；D/Q/Y 不变  
- [ ] 高级行情关：盘口/分笔为说明态，无请求风暴  
- [ ] 高级行情开：深度多档 + 分笔有更新  
- [ ] 筹码有 VP；无 L2 也可看  
- [ ] CN/加密不出现高级 Tab  

---

## 2. 模拟交易：富途 `sim-trade` OpenAPI

### 2.1 现状（本地撮合）

见 [market-trading-tech.md §4](../market-trading-tech.md)：

- Prisma：`PaperAccount` / `PaperPosition` / `PaperOrder`
- 服务端用 `getQuote` 做市价/限价/止损撮合；Worker 扫 `pending`
- UI：个股 `TradePanel`、Portfolio
- [`BrokerGateway`](../../src/lib/broker/index.ts) 预留，当前恒 `null`

**问题**：撮合与真券商规则不一致（手数、最小跳动、账户资金、成交回报）；扩展真实交易时仍要换一套。

### 2.2 目标

以 **富途云端模拟交易 REST**（与现有行情 `futu-http` 同 Host：`webapi.futunn.com`）作为模拟盘主路径：

- 文档入口：[模拟交易 · 下单](https://open.futunn.com/zh-cn/api/sim-trade/input-order)
- 路径形态：`/api/v1.0/sim-trade/{acc_id}/...`
- 鉴权：复用现有 `FUTU_ACCESS_TOKEN` / AppKey 签名（[`futu-http.ts`](../../src/lib/market/providers/futu-http.ts)）

### 2.3 已知 REST 能力（规划对接）

| 能力 | 方法（以官网为准，实现前再核对） |
|---|---|
| 模拟账户列表 | 账户/资金相关 sim-trade 列表接口 |
| 资金 | 查询模拟账户余额 |
| 持仓 | 模拟持仓列表 |
| 下单 | `POST /api/v1.0/sim-trade/{acc_id}/orders` |
| 撤单 / 改单 | 对应 sim-trade 订单接口 |
| 当日/历史订单 | 订单列表接口 |
| 最大可买可卖 | max qty 类接口（若有） |

下单 body（官网当前约定）：

| 字段 | 说明 |
|---|---|
| `market` | int，来自账户列表 `market_id` |
| `symbol` | 证券代码（港股注意手数倍数） |
| `order_type` | 1=限价，3=市价 |
| `order_side` | 1=买，2=卖，3=卖空，4=买回 |
| `qty` | string |
| `price` | 限价必填 |
| `text` | 可选备注 |

响应：`order_id` 等。

> 实现前以 [OpenAPI 门户](https://open.futunn.com/) 最新「模拟交易」章节为准，补全账户列表 / 持仓 / 撤单路径与枚举。

### 2.4 架构：双后端，UI 统一

```text
TradePanel / Portfolio
        ↓
   TradingFacade（新）
        ↓
   ┌────┴────┐
   │         │
 FutuSim   LocalPaper（兼容/回退）
 (sim-trade)  (现 Prisma 撮合)
```

- Env：`PAPER_TRADE_BACKEND=futu | local`（默认建议过渡期 `local`，验证后切 `futu`）
- **FutuSim**：下单/撤单/查持仓直接打富途；本地 DB 只存 **镜像/审计**（可选：`brokerOrderId`、`brokerAccId`、原始 JSON），或先不落库仅展示券商状态
- **LocalPaper**：保留现逻辑，富途不可用或未配置时回退，避免学习环境全挂

推荐产品语义：

| 模式 | 行为 |
|---|---|
| 富途模拟（主推） | 资金/持仓/成交以富途为准；本站 AI 复盘读同步后的快照或实时查富途 |
| 本地纸面（兼容） | 现 $100k USD 账户，规则简单，适合无富途 Key 用户 |

登录用户 + 平台/用户富途凭证齐全 → 可开「富途模拟」；否则仅本地纸面并提示配置 Key。

### 2.5 与现 API 的映射

保持对外 BFF 路径稳定，内部换实现：

| 现有 BFF | Futu 侧 |
|---|---|
| `GET /api/trading/account` | 模拟账户资金 |
| `GET /api/trading/positions` | 模拟持仓 |
| `GET/POST/DELETE /api/trading/orders` | 订单列表 / 下单 / 撤单 |
| `POST account reset` | 富途若无「一键重置」则隐藏或改为开新模拟户说明 |

符号映射：本站 `assetType+symbol` → 富途 `market` + `symbol`（复用现有 futu 代码格式）。

订单类型：先支持 **限价 + 市价**；本地 `stop` 在 Futu 模式可：

- 暂灰显，或  
- 仍用本地挂单 + 行情触发后再转富途限价/市价（复杂度高，建议一期灰显）

卖空（`order_side=3/4`）：与个股「卖空数据」展示可后续对齐；一期默认仅做多（买/卖平），与当前产品一致。

### 2.6 模块拆分（实现时）

| 模块 | 职责 |
|---|---|
| `src/lib/market/providers/futu-sim-trade.ts` | REST 封装：acc 列表、下单、撤单、持仓、资金、订单 |
| `src/lib/trading/backend.ts` | `PaperBackend` 接口 + `local` / `futu` 实现选择 |
| `src/lib/trading/symbol-map-futu.ts` | 市场与代码映射、港股手数校验提示 |
| Prisma（可选） | `PaperOrder.externalId`、`PaperAccount.externalAccId` 等镜像字段 |

Worker：Futu 模式下 **不必**再扫本地 limit/stop 撮合；若保留本地 stop 桥接再另议。提醒邮件与 digest 逻辑不变。

### 2.7 安全与合规

- 模拟交易 Key 仅服务端；不把 Token 下发浏览器  
- 文案明确：**富途模拟盘，非实盘，不构成投资建议**  
- 港股手数、美股整股规则用接口错误码转成可读提示  
- 1G：交易 API 按用户操作触发，禁止全局轮询所有用户富途账户；Portfolio 打开时再拉

### 2.8 实施切片（交易）

1. 文档定稿 + 核对富途 sim-trade 全量 REST 列表（账户/持仓/撤单）  
2. `futu-sim-trade.ts` 客户端 + 沙箱下单冒烟  
3. `PaperBackend` 抽象；`PAPER_TRADE_BACKEND=futu` 接通 account/positions/orders  
4. UI：模式标识、手数提示、stop 灰显、无 Key 回退本地  
5. （可选）订单镜像表 + AI review 读富途持仓  
6. 废弃或降级本地撮合为 fallback  

### 2.9 验收（交易）

- [ ] 配置富途 Token 后可列出模拟账户并下出限价/市价单，回报有 `order_id`  
- [ ] Portfolio / TradePanel 持仓与资金与富途一致（允许短延迟）  
- [ ] 撤单可用  
- [ ] 无富途凭证时自动本地纸面，不 500  
- [ ] 港股非手数倍数有明确错误提示  
- [ ] 日志无 Token 明文  

---

## 3. 依赖与顺序建议

```text
P0  分时图（不依赖 L2）
P0  富途 sim-trade 客户端冒烟 + PaperBackend 切换
P1  盘口 + 分笔（ADVANCED_QUOTES_ENABLED）
P1  TradePanel / Portfolio 切富途模拟主路径
P2  筹码 VP、资金、卖空
P2  订单镜像与 AI 复盘对齐富途账户
```

个股高级盘与富途模拟交易可 **并行**（不同模块），共用富途 HTTP 客户端与 1G 轮询纪律。

---

## 4. 环境变量（规划增补）

```bash
# 个股 L2 / 分笔（平台已开通高级行情时打开）
# ADVANCED_QUOTES_ENABLED=true

# 模拟交易后端：local（默认）| futu
# PAPER_TRADE_BACKEND=local

# 富途（行情与 sim-trade 共用）
# FUTU_ACCESS_TOKEN=
# FUTU_APP_KEY= + FUTU_PRIVATE_KEY=
```

---

## 5. 明确不做

- 真券商实盘下单  
- 假 Level-2 / 假成交明细  
- A 股筹码专有分布、加密订单流  
- Footprint / 刷单级 DOM  
- 用户浏览器直连富途交易 API  

---

## 6. 文档维护

- 实现启动后：本文件状态改为「进行中」，验收勾选迁到 PR  
- 稳定后：将交易后端细节并回 [market-trading-tech.md](../market-trading-tech.md) §4–5，本 PRD 保留产品口径  
