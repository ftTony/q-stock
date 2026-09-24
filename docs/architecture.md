# Q-Stock 架构说明

## 1. 总体架构

```text
┌─────────────────────────────────────────────────────────┐
│  Browser / H5 (locale 路由 + AppShell)                  │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP
┌───────────────────────────▼─────────────────────────────┐
│  Next.js App Router                                     │
│  ├─ pages: src/app/[locale]/*                           │
│  ├─ BFF API: src/app/api/*                              │
│  └─ Auth.js session (JWT)                               │
└───────┬─────────────────┬─────────────────┬─────────────┘
        │                 │                 │
        ▼                 ▼                 ▼
   PostgreSQL        Market facade     Adanos REST
   (Prisma)          (@/lib/market)    (sentiment)
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
         Longbridge    Futu OpenAPI  Finnhub
         (quotes)      (云端 REST)   (quotes+news)
        ▲
        │
┌───────┴────────┐
│ Alert Worker   │──► market.getQuote ──► Resend / SMTP
│ price-alerts   │    (+ paper limit/stop fill)
└────────────────┘
```

原则：

- 浏览器不直连券商 / Finnhub / Adanos，密钥仅在服务端
- 行情经 `MARKET_DATA_PROVIDERS` 优先级路由；长桥/富途仅在登录用户 BYOK 后启用，游客走 Finnhub/币安
- 业务数据（用户、自选、评论、提醒、模拟交易）落 Postgres
- 行情类数据以短时缓存为主，不落库
- 真实券商下单预留 `@/lib/broker`（本阶段未接通）

## 2. 进程与部署单元

| 单元 | 入口 | 职责 |
|---|---|---|
| web | Next.js `server.js`（Docker）或 `next dev` | UI + BFF + Auth |
| worker | `src/workers/price-alerts.ts` | 轮询价格提醒并发邮件；撮合模拟限价/止损单 |
| db | PostgreSQL 16 | 持久化 |

Docker Compose 中三者同启；本地开发通常只 Compose 起 `db`，本机跑 web + worker。

## 3. 目录结构

```text
src/
  app/
    [locale]/          # 多语言页面
    api/               # Route Handlers（BFF）
  components/
    layout/            # AppShell / TopBar
    market/            # 行情表、sparkline
    charts/            # KLineChart
    providers/         # Session / Theme / 涨跌色
  lib/
    market/            # 多行情源 facade + longbridge/futu/finnhub providers
    broker/            # 真实下单扩展点（Phase 2 stub）
    trading/           # 模拟交易撮合
    finnhub/           # Finnhub 资讯（新闻/财报/公告）
    adanos/            # Adanos 客户端
    indicators/        # MA/EMA/BOLL/RSI/MACD
    candles/           # 季K/年K 聚合
    auth/              # Auth.js 配置
    cache.ts           # 内存 + ApiCache 表
  workers/
    price-alerts.ts
  i18n/                # next-intl 配置
messages/              # zh-CN / zh-TW / en
prisma/                # schema + migrations
docs/                  # 项目文档
```

## 4. 前端信息架构

- **AppShell**：左侧导航、顶栏（语言/主题/通知）、H5 底栏
- **市场总览 `/`**：热门行情 KPI、表格、叙事新闻、情绪
- **自选 `/watchlist`**：用户自选 CRUD + 报价
- **资产概览 `/portfolio`**：自选监控仪表盘
- **分析 `/analysis`**：标的卡片入口
- **详情 `/symbol/[assetType]/[symbol]`**：K 线、指标、资讯 Tab、提醒
- **提醒 `/alerts`**：创建与管理触发条件
- **设置 `/settings`**：语言 / 主题 / 涨跌色

默认视觉：深色终端风格（Quantum Trade 参考），涨跌色默认偏国际习惯（可改）。

## 5. 鉴权流

1. `POST /api/auth/register` 创建用户（bcrypt 哈希密码）
2. Auth.js Credentials 登录 → JWT Session
3. 受保护 API（自选 / 评论写 / 提醒 / 设置）通过 `auth()` 取 `session.user.id`
4. 设置变更写库后，前端 `session.update` 同步 locale / theme / changeColorScheme

## 6. 数据流要点

### 6.1 行情

```text
客户端 → /api/quotes|candles|search
       → lib/finnhub (带 token、重试、429 退避)
       → cachedFetch (短 TTL)
```

加密符号：内部 `BTC` → Finnhub `BINANCE:BTCUSDT`。

### 6.2 K 线与指标

- 日 K：Finnhub `D`
- 季 / 年：月 K 或日 K → `aggregateCandles`
- 指标：服务端 `computeIndicators`，随 candles 响应返回
- 图表：客户端 KLineChart（`klinecharts`）+ 内置指标与画线 Overlay

### 6.3 情绪

```text
/api/sentiment → lib/adanos → 长 TTL 缓存
失败 / 无 Key → available:false 降级文案
```

### 6.4 价格提醒

```text
用户创建 PriceAlert(active)
Worker 定时：
  查 active → 去重拉 quote → 满足条件
  → 发邮件 → status=triggered + AlertDeliveryLog
```

同一提醒触发后不再重复发送，除非用户重新启用。

### 6.5 模拟交易

```text
用户下单 → market：即时按 quote 成交更新现金/持仓
         → limit/stop：写入 pending
Worker 同进程：
  查 pending limit/stop → 拉 quote → 触发则成交
  资金/持仓不足则 status=rejected
```

仅做多；初始现金 $100,000。

## 7. 数据模型（摘要）

| Model | 用途 |
|---|---|
| User | 账号与偏好 |
| WatchlistItem | 自选 |
| PriceAlert | 价格提醒 |
| AlertDeliveryLog | 发信审计 |
| Comment | 标的评论（软删） |
| PaperAccount | 模拟账户现金 |
| PaperPosition | 模拟持仓 |
| PaperOrder | 模拟委托 |
| ApiCache | 外部 API 结果缓存 |

枚举：`AssetType`、`ThemeMode`、`ChangeColorScheme`、`LocaleCode`、`AlertCondition`、`AlertStatus`、`OrderSide`、`OrderType`、`OrderStatus`。

## 8. 国际化与主题

- `next-intl` + `localePrefix: always`
- 文案：`messages/{zh-CN,zh-TW,en}.json`
- DB locale：`zh_CN` / `zh_TW` / `en`（与路由 locale 互转）
- CSS 变量：`--up` / `--down` / `--brand` 等，`data-change` 控制涨跌色

## 9. 缓存策略（经验值）

| 数据类型 | 典型 TTL |
|---|---|
| quote | ~15s |
| candles | ~60–120s |
| news | ~3–5min |
| earnings / press | ~10min |
| Adanos sentiment | ~30min |

实现见 `src/lib/cache.ts`（内存优先，Postgres `ApiCache` 尽力而为）。

## 10. 安全边界

- `.env` 不入库；模板见 `.env.example`
- API Key 不下发前端
- 密码 bcrypt；提醒删除 / 评论删除校验归属用户
- Docker 生产镜像以 standalone + 非 root 用户运行 web

## 11. 相关文档

- [需求文档](./requirements.md)
- [启动与环境](./getting-started.md)
- [API 参考](./api.md)
