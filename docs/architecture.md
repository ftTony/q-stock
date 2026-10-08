# Q-Stock 架构说明

## 1. 总体架构

```text
┌──────────────────────────────────────────────────────────┐
│  Browser / H5 (locale + AppShell / 可折叠侧栏 / 底栏)     │
└────────────────────────────┬─────────────────────────────┘
                             │ HTTP
┌────────────────────────────▼─────────────────────────────┐
│  Next.js App Router                                      │
│  ├─ pages: src/app/[locale]/*                            │
│  ├─ BFF: src/app/api/*                                   │
│  └─ Auth.js (Credentials + 可选 Google/GitHub, JWT)      │
└───────┬──────────────┬──────────────┬────────────────────┘
        │              │              │
        ▼              ▼              ▼
   PostgreSQL     Market facade    Adanos / AI vendors
   (Prisma)       (@/lib/market)   (sentiment / analyze)
        │              │
        │    ┌─────────┼─────────┬──────────┐
        │    ▼         ▼         ▼          ▼
        │ Longbridge  Futu     Finnhub   Binance/OKX
        │ (equity)    (equity) (fallback) (crypto)
        │
┌───────┴────────┐
│ Alert Worker   │──► market.getQuote ──► Resend / SMTP
│ (+ paper fill) │
└────────────────┘
```

原则：

- 浏览器不直连券商 / Finnhub / Adanos / AI；密钥仅在服务端
- 行情：`MARKET_DATA_PROVIDERS` + 用户 `equityVendor` / `cryptoVendor`；**env Key 优先于 BYOK**（`resolve-market-creds.ts`）
- 请求内 `withUserMarket(userId)` 把用户 BYOK 注入 AsyncLocalStorage
- **扶摇（fuyao）在 router 中硬关闭**，不参与 failover
- 业务数据落 Postgres；行情短时缓存
- 真实下单 `@/lib/broker` 仍为 stub

## 2. 进程与部署单元

| 单元 | 入口 | 职责 |
|---|---|---|
| web | Next.js | UI + BFF + Auth |
| worker | `src/workers/price-alerts.ts` | 提醒邮件 + 模拟限价/止损撮合 + 美股收盘自选摘要 |
| db | PostgreSQL 16 | 持久化 |

## 3. 目录结构（节选）

```text
src/
  app/[locale]/          # 页面：markets / analysis / symbol / watchlist / …
  app/api/               # BFF
  components/
    layout/              # AppShell、AppSidebar、TopbarIndexTicker、…
    market/              # 仪表盘、排行榜、热力、加密表、…
    symbol/              # 详情头、图表区、Tabs
    charts/              # CandleChart + 画线
    settings/            # BYOK / AI / 邀请等表单
  lib/
    market/              # facade、router、resolve-market-creds、providers/*
    trading/             # 模拟账户 / 撮合
    broker/              # 实盘扩展点（stub）
    ai/                  # 多厂商 AI
    news.ts              # 个股新闻聚合
    adanos/              # 情绪
    digest/              # 美股收盘自选摘要邮件
    crypto/secret-box.ts # BYOK 加解密
  workers/price-alerts.ts
  i18n/
messages/                # 10 份 locale JSON
prisma/
docs/
```

## 4. 前端信息架构

| 区域 | 行为 |
|---|---|
| `AppSidebar` | 市场 / 分析 / 自选 / 资产 / 提醒；底栏快捷入口；**收起仅图标**（持久化） |
| 顶栏 | 指数轮播、数据源角标、主题/语言/用户操作 |
| `/` | 市场 Tab（含 cn）、KPI、热力、排行（爱心）、IPO/情绪 |
| `/analysis` | 热门卡片进详情 |
| `/symbol/...` | 紧凑头 + K 线 + TradePanel + Tabs |
| `/watchlist` `/portfolio` `/alerts` `/settings` `/about` | 自选、模拟账户、提醒、设置、关于 |
| H5 | 底栏：市场 / 自选 / 提醒 / 资产 |

## 5. 鉴权流

1. `POST /api/auth/register`（可校验邀请码）→ bcrypt
2. Credentials 或 OAuth → JWT Session
3. 受保护写接口用 `auth()` 取 `user.id`
4. 设置变更后 `session.update` 同步偏好

## 6. 行情数据流

1. API Handler → `withUserMarket(session?.user?.id, …)`
2. `listProvidersFor(assetType)`：按 vendor 偏好排序可用源（已配置 = env 或 BYOK）
3. `withProviderFailover` 依次调用；失败换下一源
4. 响应可带 `source`；`/api/health` 暴露 provider 状态

凭证：

| 层 | 模块 |
|---|---|
| 解析 | `resolveLongbridgeCreds` 等（env ?? ALS） |
| 用户库 | `UserMarketCredential` + `encryptJson` / `decryptJson` |
| 注入 | `creds-context` AsyncLocalStorage |

资产类型：`stock` | `hk` | `cn` | `crypto`。

## 7. 模拟交易与提醒

- 账户 / 持仓 / 订单：`@/lib/trading/*` + `/api/trading/*`
- Worker：同进程处理提醒发信与 pending 限价/止损成交

## 8. 缓存与安全

- `cachedFetch`：内存 + `ApiCache` 表；键带源前缀
- BYOK 不明文回传前端；设置页只显示「已配置」
- `CREDENTIALS_ENCRYPTION_KEY` 必须保密（有 key + DB 密文即可解密）

## 9. 相关文档

- [启动与环境](./getting-started.md)
- [行情多源与模拟交易](./market-trading-tech.md)
- [需求](./requirements.md)
- [API](./api.md) · [数据库](./database.md)
