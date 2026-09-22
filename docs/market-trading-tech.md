# 行情多源与模拟交易 — 技术实现思路

本文整理当前代码中的**行情数据源抽象**与**模拟交易**实现思路，便于后续扩展真实券商下单或新增数据源。

相关代码入口：

| 模块 | 路径 |
|---|---|
| 行情门面 | [`src/lib/market/`](../src/lib/market/) |
| 模拟交易 | [`src/lib/trading/`](../src/lib/trading/) |
| 真实下单扩展点 | [`src/lib/broker/`](../src/lib/broker/) |
| 提醒 / 挂单 Worker | [`src/workers/price-alerts.ts`](../src/workers/price-alerts.ts) |

---

## 1. 目标与边界

### 1.1 已实现

- 多行情源统一接入：**长桥 → 富途 → Finnhub**（可 env 调整优先级）
- 单源失败自动回退到下一源
- 资讯（新闻 / 财报 / 公告）仍走 **Finnhub**
- **模拟交易**（仅做多）：市价 / 限价 / 止损；个股右侧面板 + Portfolio 账户视图
- 真实券商下单预留 `BrokerGateway`，本阶段不接通

### 1.2 不做（本阶段）

- 真实长桥 / 富途下单与持仓同步
- 做空、融资融券
- 浏览器直连券商 API（密钥只在服务端）

---

## 2. 总体架构

```text
Browser / H5
    │  HTTP
    ▼
Next.js BFF  (/api/quotes|candles|search|trading|…)
    │
    ├──────────────────────┐
    ▼                      ▼
@/lib/market            @/lib/trading  (模拟盘)
  ProviderRouter            │
  ├ longbridge              ├ ensureAccount ($100k)
  ├ futu (云端 REST)        ├ placeOrder / cancel
  └ finnhub                 └ applyFill (事务)
    │
    └─ Worker 共用 getQuote
         ├ 价格提醒发信
         └ 限价/止损挂单撮合

资讯 API ──► @/lib/finnhub/client  (news / earnings / press)

未来真实下单 ─·─► @/lib/broker (stub)
```

原则：

1. **调用方只依赖门面**，不直接 import 某个券商 SDK
2. **行情与资讯解耦**：报价/K 线可多源；资讯仍 Finnhub
3. **模拟成交价**取当前门面 `getQuote().price`，与真实券商无关
4. **密钥与签名只在服务端**，通过 `.env` 配置

---

## 3. 行情多源设计

### 3.1 Provider 接口

定义见 [`src/lib/market/types.ts`](../src/lib/market/types.ts)：

```ts
interface MarketDataProvider {
  id: "longbridge" | "futu" | "finnhub";
  isConfigured(): boolean;
  supports?(assetType: AssetType): boolean;
  getQuote(symbol, assetType): Promise<QuoteWithSource>;
  getQuotes(items): Promise<QuoteWithSource[]>;
  getDailyCandles(...): Promise<OhlcvBar[]>;
  getMonthlyCandles(...): Promise<OhlcvBar[]>;
  searchSymbols(q, assetType): Promise<SearchResult[]>;
}
```

- `supports`：例如富途 / 长桥侧重股票，加密可跳过并交给 Finnhub
- `QuoteWithSource` 在标准 `Quote` 上增加可选 `source`，便于排查当前命中哪一路

### 3.2 路由与回退

[`src/lib/market/router.ts`](../src/lib/market/router.ts)：

1. 读取 `MARKET_DATA_PROVIDERS`（CSV）；未配置则按默认顺序过滤「已配置凭证」的源
2. 默认顺序：`longbridge,futu,finnhub`
3. `withProviderFailover`：按序调用，失败记日志并试下一个；全部失败再抛错

门面 [`src/lib/market/index.ts`](../src/lib/market/index.ts) 对外只暴露：

- `getQuote` / `getQuotes`
- `getDailyCandles` / `getMonthlyCandles`
- `searchSymbols`
- `getActiveProviders` / `getProviderPriority`（供 `/api/health`）

### 3.3 符号映射

内部统一用短码（如 `AAPL`、`BTC`），出站再映射：

| 源 | 股票示例 | 说明 |
|---|---|---|
| Longbridge | `AAPL.US` | 港股数字码 → `00700.HK` |
| Futu | `US.AAPL` | 港股 → `HK.00700` |
| Finnhub | `AAPL` | 加密 → `BINANCE:BTCUSDT` |

实现：[`src/lib/market/symbols.ts`](../src/lib/market/symbols.ts)

### 3.4 各 Provider 要点

#### 长桥（`providers/longbridge.ts`）

- 依赖 npm `longbridge`
- `Config.fromApikey` + `QuoteContext.quote` / `candlesticks`
- Env：`LONGBRIDGE_APP_KEY` / `SECRET` / `ACCESS_TOKEN`
- Next 配置：`serverExternalPackages: ["longbridge"]`（原生绑定）

#### 富途（`providers/futu.ts`）— 云端 OpenAPI，**不用 OpenD**

依据 [Futu OpenAPI 概览](https://open.futunn.com/zh-cn/api/overview/)：

| 项 | 值 |
|---|---|
| Host | `https://webapi.futunn.com`（可用 `FUTU_HTTP_URL` 覆盖） |
| 快照 | `POST /api/v1.0/quote/snapshot` body `{ code_list: ["US.AAPL"] }` |
| 历史 K | `GET /api/v1.0/quote/{symbol}/history-kline?ktype=2\|4&…` |

鉴权（二选一，适合服务端 env）：

1. **Bearer**：`FUTU_ACCESS_TOKEN` → `Authorization: Bearer …`
2. **Legacy AppKey**：`FUTU_APP_KEY` + `FUTU_PRIVATE_KEY`（或 `_PATH`）  
   签名串：`timestamp\nMETHOD\npath\nquery\nsha256(body)`，算法默认 Ed25519（`FUTU_SIGN_ALG`）

#### Finnhub（`providers/finnhub.ts`）

- REST：`/quote`、`/stock/candle`、`/crypto/candle`、`/search`
- 同时作为**加密主源**与**资讯后端**
- 资讯仍由 [`src/lib/finnhub/client.ts`](../src/lib/finnhub/client.ts) 提供（news / earnings / press / metric）
- 旧的 `getQuote` 等从 `@/lib/finnhub/client` re-export 到 `@/lib/market`，避免双份逻辑

### 3.5 缓存

各 Provider 内部对 quote / candle 使用现有 `cachedFetch`（内存 + `ApiCache` 表），键带源前缀，例如 `lb:quote:…`、`futu:quote:…`、`fh:quote:…`，避免串缓存。

### 3.6 调用改造清单

以下均改为 `import { getQuote, … } from "@/lib/market"`：

- `/api/quotes`、`/api/candles`、`/api/search`、`/api/watchlist`
- `/api/trading/positions`、`src/lib/trading/orders.ts`
- Worker `price-alerts.ts`
- `/api/health` 暴露 `providers` + `providerPriority`

---

## 4. 模拟交易设计

### 4.1 模型（Prisma）

- `PaperAccount`：每用户一账户，初始现金 **$100,000** USD
- `PaperPosition`：`(userId, symbol, assetType)` 唯一；`qty` + `avgCost`
- `PaperOrder`：`side` / `type` / `qty` / `limitPrice?` / `stopPrice?` / `status`

仅做多：卖出数量不可超过可用持仓（含已挂卖单预留）。

### 4.2 撮合规则

| 类型 | 行为 |
|---|---|
| market | 拉 `getQuote`，事务内立即成交 |
| limit | 买：`price <= limit`；卖：`price >= limit` |
| stop | 买：`price >= stop`；卖：`price <= stop` |

- 下单瞬间若已触发，**立即成交**；否则 `pending`，由 Worker 轮询
- 成交价 = 触发时行情价（无滑点模型）
- 买入更新加权均价；卖出减仓，qty→0 删持仓

核心：[`account.ts`](../src/lib/trading/account.ts) / [`execute.ts`](../src/lib/trading/execute.ts) / [`orders.ts`](../src/lib/trading/orders.ts)

### 4.3 API

| 路由 | 作用 |
|---|---|
| `GET/POST /api/trading/account` | 查询；`POST { action:"reset" }` 重置 |
| `GET /api/trading/positions?quotes=1` | 持仓 + 可选浮盈 |
| `GET/POST/DELETE /api/trading/orders` | 委托列表 / 下单 / 撤单 |

### 4.4 UI

- 个股页：`TradePanel` 右侧栏（买/卖、类型、数量、挂单撤单）
- Portfolio：现金 / 权益 / 持仓 / 挂单 / 最近成交 / 重置

### 4.5 Worker

同一进程 [`price-alerts.ts`](../src/workers/price-alerts.ts)：

1. 处理价格提醒邮件
2. 扫描 `pending` 的 limit/stop，命中则 `fillPendingOrder`；资金/持仓不足则 `rejected`

---

## 5. 真实下单扩展点（Phase 2）

[`src/lib/broker/index.ts`](../src/lib/broker/index.ts)：

```ts
interface BrokerGateway {
  id: "longbridge" | "futu";
  isConfigured(): boolean;
  placeOrder(req): Promise<BrokerOrderResult>;
  cancelOrder(id): Promise<void>;
}

getBrokerGateway(): BrokerGateway | null  // 当前恒为 null
```

后续建议：

1. 长桥：`TradeContext` 下单 / 查单
2. 富途：同一套云端 OpenAPI 的 trade 接口（非 OpenD）
3. UI 增加「模拟 / 实盘」开关；实盘路径走 `BrokerGateway`，模拟仍走 `PaperOrder`
4. 不要把用户券商私钥下发到浏览器

---

## 6. 环境变量摘要

```bash
MARKET_DATA_PROVIDERS=longbridge,futu,finnhub

# 长桥
LONGBRIDGE_APP_KEY=
LONGBRIDGE_APP_SECRET=
LONGBRIDGE_ACCESS_TOKEN=

# 富途（云端，二选一）
FUTU_ACCESS_TOKEN=
# FUTU_APP_KEY=
# FUTU_PRIVATE_KEY=          # 或 FUTU_PRIVATE_KEY_PATH=
# FUTU_SIGN_ALG=ed25519
# FUTU_HTTP_URL=https://webapi.futunn.com

# Finnhub（回退 + 资讯）
FINNHUB_API_KEY=
```

完整说明见 [启动与环境](./getting-started.md) 与仓库根目录 [.env.example](../.env.example)。

---

## 7. 扩展指南（简）

### 新增行情源

1. 在 `providers/` 实现 `MarketDataProvider`
2. 注册进 `router.ts` 的 `REGISTRY` 与默认顺序
3. 补充符号映射与 env / health 探测
4. 文档更新本页与 `getting-started`

### 改优先级

只改 env：`MARKET_DATA_PROVIDERS=futu,longbridge,finnhub`，无需改代码。

### 调试当前命中源

- 看 quote 响应里的 `source` 字段
- 或 `GET /api/health` 的 `providers` / `providerPriority`
- 服务端日志：`[market] quote XXX via longbridge failed: …`

---

## 8. 已知限制

1. 富途 / 长桥搜索能力弱时，搜索可能回退到 Finnhub 或仅返回「精确 ticker」提示
2. 加密行情以 Finnhub 为主；券商源对 crypto 会 `supports=false` 或主动失败以触发回退
3. 模拟挂单依赖 Worker 轮询间隔（默认约 45s），非交易所级实时撮合
4. 富途 AppKey 模式需妥善保管私钥，勿提交仓库

---

## 9. 相关文档

- [架构说明](./architecture.md)
- [API 参考](./api.md)（含 trading / health）
- [数据库说明](./database.md)（Paper* 表）
- [需求文档](./requirements.md)
- [启动与环境](./getting-started.md)
