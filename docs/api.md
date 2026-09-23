# Q-Stock API 参考

Base URL：同源，例如 `http://localhost:3000`。  
鉴权：Auth.js Session Cookie（浏览器自动携带）。标注 **需登录** 的接口无 Session 时返回 `401`。

通用约定：

- `assetType`：`stock` | `hk` | `crypto`
- 错误体常见形态：`{ "error": "..." }`
- 部分外部依赖失败会返回降级字段：`degraded: true` 或空数组

---

## 健康检查

### `GET /api/health`

无需登录。

**响应示例**

```json
{
  "ok": true,
  "providers": { "longbridge": true, "futu": false, "finnhub": true, "binance": true },
  "providerPriority": ["longbridge", "finnhub", "binance"],
  "brokers": [
    { "id": "longbridge", "configured": true, "ready": false },
    { "id": "futu", "configured": false, "ready": false }
  ],
  "finnhub": true,
  "longbridge": true,
  "futu": false,
  "adanos": false,
  "deepseek": true,
  "binance": true
}
```

`ok: false` 通常表示数据库不可用。报价/K 线经 `@/lib/market` 按资产类型选择源并回退（加密优先 Binance 公共行情）。

---

## 鉴权

### `POST /api/auth/register`

注册。

**Body**

```json
{
  "email": "user@example.com",
  "password": "secret1",
  "name": "可选昵称",
  "locale": "zh-CN"
}
```

**成功**：`201` + `{ "user": { "id", "email", "name" } }`  
**冲突**：`409` 邮箱已存在。

### `GET|POST /api/auth/[...nextauth]`

Auth.js 内置路由（Credentials 登录 / Session / CSRF 等）。前端使用 `next-auth/react` 的 `signIn` / `signOut` / `useSession`。

---

## 用户设置

### `GET /api/user/settings`（需登录）

返回当前用户偏好。

### `PATCH /api/user/settings`（需登录）

**Body（字段均可选）**

```json
{
  "locale": "zh-CN",
  "theme": "dark",
  "changeColorScheme": "us",
  "name": "Nick"
}
```

- `locale`：`zh-CN` | `zh-TW` | `en`
- `theme`：`light` | `dark` | `system`
- `changeColorScheme`：`cn` | `us`

---

## 行情

### `GET /api/quotes`

| 参数 | 说明 |
|---|---|
| `popular=1` | 返回热门列表；配合 `assetType` |
| `symbol` | 单标的报价（与 popular 二选一） |
| `assetType` | 默认 `stock` |

**示例**

- `/api/quotes?popular=1&assetType=stock`
- `/api/quotes?popular=1&assetType=hk`
- `/api/quotes?symbol=AAPL&assetType=stock`
- `/api/quotes?symbol=00700&assetType=hk`
- `/api/quotes?symbol=BTC&assetType=crypto`

**响应**：`{ "quotes": [...] }` 或 `{ "quote": {...} }`

### `GET /api/search`

| 参数 | 说明 |
|---|---|
| `q` | 关键词 |
| `assetType` | `stock` / `hk` / `crypto` |

**响应**：`{ "results": [{ symbol, description, assetType, ... }] }`

### `GET /api/candles`

| 参数 | 说明 |
|---|---|
| `symbol` | 必填 |
| `assetType` | 默认 `stock` |
| `resolution` | `D` / `Q` / `Y`，默认 `D` |
| `from` / `to` | 可选 Unix 秒；用于拖动图表时分页拉取更早历史 |
| `indicators` | 传 `0` 可关闭指标计算 |

默认窗口：日 K 约 1.5 年；未传 `from`/`to` 时按周期回退。左滑加载更早数据时前端传入更早的 `from`/`to` 并合并。

**响应**

```json
{
  "bars": [{ "time": 0, "open": 0, "high": 0, "low": 0, "close": 0, "volume": 0 }],
  "indicators": { "ma7": [], "ema12": [], "boll": {}, "rsi": [], "macd": {} },
  "resolution": "D",
  "from": 0,
  "to": 0,
  "hasMore": true
}
```

---

## 资讯

### `GET /api/news`

| 参数 | 说明 |
|---|---|
| `symbol` | 可选；缺省返回市场新闻 |
| `assetType` | 影响市场新闻类别 / 过滤 |

### `GET /api/earnings`

| 参数 | 说明 |
|---|---|
| `symbol` | 必填（**美股**） |

聚合 Finnhub：`/stock/earnings`（EPS 惊喜）、`/calendar/earnings`（日历）、`/stock/metric`（基础财务）。

**港股 / 加密**：前端不调用本接口（详情页展示 N/A）；本接口按美股 Finnhub 符号处理，未针对 `assetType=hk` 做适配。

成功示例：

```json
{
  "symbol": "AAPL",
  "surprises": [{ "period": "2024-12-31", "actual": 2.4, "estimate": 2.35, "surprisePercent": 2.1, "quarter": 1, "year": 2025 }],
  "calendar": {
    "upcoming": [{ "date": "2025-04-28", "epsEstimate": 1.5, "revenueEstimate": 9e10, "hour": "amc", "quarter": 2, "year": 2025 }],
    "recent": []
  },
  "metrics": [{ "key": "peTTM", "value": 28.5 }],
  "degraded": false
}
```

全部上游失败或无数据时：`degraded: true`，列表可为空。

### `GET /api/press`

| 参数 | 说明 |
|---|---|
| `symbol` | 必填（**美股**） |

套餐不足或无数据时可能降级为空列表。**港股 / 加密**详情页不调用本接口（N/A）。

---

## 模拟交易（需登录）

仅做多。初始虚拟资金 `$100,000`。市价单按最新报价立即成交；限价 / 止损由 Worker 轮询撮合。

### `GET /api/trading/account`

返回 `{ account: { cashBalance, currency, ... } }`，无账户时自动开户。

### `POST /api/trading/account`

Body：`{ "action": "reset" }` — 清空持仓与订单，现金恢复 `$100,000`。

### `GET /api/trading/positions`

| 参数 | 说明 |
|---|---|
| `quotes` | `1` 时附带现价与浮盈 |

### `GET /api/trading/orders`

| 参数 | 说明 |
|---|---|
| `status` | `pending` / `filled` / `cancelled` / `rejected` |
| `symbol` / `assetType` | 可选过滤 |

### `POST /api/trading/orders`

Body：`{ symbol, assetType, side, type, qty, limitPrice?, stopPrice? }`  
`type`：`market` | `limit` | `stop`；`side`：`buy` | `sell`（卖出不可超过持仓）。

### `DELETE /api/trading/orders?id=`

仅可撤销 `pending` 订单。

---

## 情绪（Adanos）

### `GET /api/sentiment`

| 参数 | 说明 |
|---|---|
| `symbol` | 可选；缺省为市场情绪 |
| `assetType` | `stock` / `hk` / `crypto` |

**有 symbol**：`{ "sentiment": { "news"?: {...}, "reddit"?: {...} } }`  
**无 symbol**：`{ "market": { "available", "bullish_pct", ... } }`

无 Key / 额度不足时 `available: false` 并带 `message`。

---

## AI 趋势分析

### `GET /api/ai/analyze`

无需登录。综合近期新闻、财报与报价，经 **Vercel AI SDK + DeepSeek**（`generateObject`）生成结构化趋势判断。结果缓存约 30 分钟。

| 参数 | 说明 |
|---|---|
| `symbol` | 必填 |
| `assetType` | `stock` / `hk` / `crypto`（港股/加密无 Finnhub 财报时仅用新闻+报价） |
| `locale` | `zh-CN` / `zh-TW` / `en`，影响生成文案语言 |

**响应示例**

```json
{
  "available": true,
  "cached": false,
  "degraded": false,
  "symbol": "AAPL",
  "assetType": "stock",
  "disclaimer": "…",
  "analysis": {
    "bias": "bullish",
    "confidence": 0.62,
    "horizon": "short",
    "summary": "…",
    "drivers": ["…"],
    "risks": ["…"],
    "sourcesUsed": { "news": 10, "earnings": 6, "metrics": 8, "hasQuote": true }
  }
}
```

未配置 `DEEPSEEK_API_KEY` 时：`available: false` + `message`。

---

## 评论

### `GET /api/comments`

| 参数 | 说明 |
|---|---|
| `symbol` | 必填 |
| `assetType` | 默认 `stock` |

### `POST /api/comments`（需登录）

```json
{ "symbol": "AAPL", "assetType": "stock", "content": "看法…" }
```

### `DELETE /api/comments?id=`（需登录）

仅作者可软删除。

---

## 自选

### `GET /api/watchlist`（需登录）

| 参数 | 说明 |
|---|---|
| `quotes=1` | 附带实时报价 |

**响应**含 `items` 与 `counts: { stock, crypto, total }`。

### `POST /api/watchlist`（需登录）

```json
{ "symbol": "AAPL", "assetType": "stock" }
```

幂等 upsert。

### `DELETE /api/watchlist`（需登录）

二选一：

- `?id=<watchlistItemId>`
- `?symbol=AAPL&assetType=stock`

---

## 价格提醒

### `GET /api/alerts`（需登录）

返回当前用户提醒列表（`triggerPrice` 已转为 number）。

### `POST /api/alerts`（需登录）

```json
{
  "symbol": "AAPL",
  "assetType": "stock",
  "condition": "gte",
  "triggerPrice": 200
}
```

`condition`：`gte` | `lte`

### `PATCH /api/alerts`（需登录）

```json
{ "id": "...", "status": "active" }
```

`status`：`active` | `disabled`（重新启用会清空 `triggeredAt`）

### `DELETE /api/alerts?id=`（需登录）

删除提醒。

---

## Worker（非 HTTP）

进程：`npm run worker` → `src/workers/price-alerts.ts`

行为摘要：

1. 读取 `status=active` 的提醒
2. 按 symbol 去重请求 Finnhub quote
3. 满足条件则发邮件并标记 `triggered`，写入 `AlertDeliveryLog`

环境变量见 [启动与环境](./getting-started.md)。

---

## 相关文档

- [架构说明](./architecture.md)
- [需求文档](./requirements.md)
- [启动与环境](./getting-started.md)
