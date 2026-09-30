# Q-Stock

**语言：** [简体中文](./README.md) · [English](./README.en.md) · [繁體中文](./README.zh-TW.md)

美股 / 港股 / A 股 / 数字货币行情 Web & H5：多源行情、K 线指标、资讯评论、模拟交易、价格邮件提醒、市场情绪与 AI 分析。

## 功能亮点

| 模块 | 说明 |
|---|---|
| 行情浏览 | 美股 / 港股 / **A 股** / 加密热门与涨跌榜；搜索；约 45s 静默刷新 |
| 多源行情 | 股票：**长桥 ↔ 富途 → Finnhub**（设置页可选优先券商）；加密：**Binance ↔ OKX → Finnhub**；凭证 **平台 env 优先，否则用户 BYOK** |
| 市场页 | KPI、排行榜（爱心自选）、行业热力（非加密）、港股 IPO、情绪条；顶栏多市场指数轮播 |
| 个股详情 | 日/季/年 K（KLineChart + 画线）、MA/EMA/BOLL/RSI/MACD；紧凑报价头 + 爱心自选；右侧模拟下单 |
| 资讯 Tab | 新闻（长桥→富途→Finnhub）、财报/公告、公司简介/高管、评论、情绪、AI 分析 |
| 标的分析 | `/analysis` 热门卡片入口，按市场切换 |
| 自选 & 资产 | 自选 CRUD（含 cn）、sparkline；Portfolio 资金/持仓/挂单/重置 |
| 价格提醒 | ≥ / ≤ 触发邮件（Resend / SMTP）；Worker 轮询 |
| 模拟交易 | 仅做多；市价 / 限价 / 止损；初始 **$100,000** |
| 设置 | 语言 / 主题 / 涨跌色；长桥·富途·币安·OKX BYOK；多厂商 AI Key；邀请码 |
| 体验 | 10 语言、亮暗主题、红涨绿跌/绿涨红跌；侧栏可收起（图标模式）；H5 底栏 |

技术栈：Next.js 15 · TypeScript · Tailwind · KLineChart · Auth.js · Prisma · PostgreSQL · Docker。

> 扶摇（Fuyao）客户端代码仍在仓库中，**当前路由层已屏蔽**，设置页也不展示；A 股走长桥/富途/Finnhub。

## 环境要求

- Node.js **20+**（推荐 22）
- npm 10+
- Docker（可选，用于 Postgres 或全栈）

至少配置 **一个** 可用行情源：平台 env（长桥 / 富途 / Finnhub 等）和/或登录后设置页 BYOK。资讯依赖 Finnhub 或券商内容接口；情绪依赖 Adanos（可选）；AI 依赖用户 BYOK 或 `DEEPSEEK_API_KEY`（可选）。

## 快速开始

```bash
cp .env.example .env
# 编辑 .env：AUTH_SECRET、DATABASE_URL、CREDENTIALS_ENCRYPTION_KEY，以及至少一个行情源

docker compose up -d db
npm install
npm run db:migrate
npm run dev
```

另开终端启动 Worker（价格提醒 + 模拟限价/止损撮合）：

```bash
npm run worker
```

浏览器打开 [http://localhost:3000](http://localhost:3000)（默认 locale 为 `/en`，可在界面切换）。

全栈一键：

```bash
docker compose up --build
```

## 环境配置

复制 [.env.example](./.env.example) 为 `.env`。常用变量：

### 应用与数据库

| 变量 | 必填 | 说明 |
|---|---|---|
| `APP_URL` | 建议 | 如 `http://localhost:3000` |
| `AUTH_SECRET` | 是 | Auth.js 密钥 |
| `AUTH_TRUST_HOST` | 建议 | Docker / 反代时设 `true` |
| `DATABASE_URL` | 是 | PostgreSQL 连接串 |
| `AUTH_GOOGLE_ID` / `SECRET` | 否 | Google OAuth |
| `AUTH_GITHUB_ID` / `SECRET` | 否 | GitHub OAuth |

### 行情数据源

凭证解析（`src/lib/market/resolve-market-creds.ts`）：**服务端环境变量优先**；未配置时用登录用户设置页 BYOK（AES 加密存库）。

| 变量 | 说明 |
|---|---|
| `MARKET_DATA_PROVIDERS` | 优先级 CSV；省略则按已配置凭证探测 |
| `LONGBRIDGE_APP_KEY` / `SECRET` / `ACCESS_TOKEN` | 平台长桥（三键齐全） |
| `FUTU_ACCESS_TOKEN` 或 `FUTU_APP_KEY` + `PRIVATE_KEY` | 平台富途 |
| `BINANCE_API_KEY` / `SECRET` | 可选 |
| `OKX_API_KEY` / `SECRET` / `PASSPHRASE` | 可选 |
| `FINNHUB_API_KEY` | 回退行情 + 大量资讯 |
| `CREDENTIALS_ENCRYPTION_KEY` | 加密用户 BYOK（设置页保存 Key 时必填） |

### 其他

| 变量 | 说明 |
|---|---|
| `ADANOS_API_KEY` | 市场情绪 |
| `DEEPSEEK_API_KEY` | 平台 AI 兜底（用户也可在设置页配多厂商 Key） |
| `EMAIL_FROM` / `RESEND_API_KEY` / `SMTP_*` | 提醒与找回密码邮件 |
| `ALERT_POLL_INTERVAL_MS` | Worker 轮询间隔，默认 `45000` |

## 实现要点（简）

| 能力 | 实现 |
|---|---|
| 行情门面 | `@/lib/market`：`getQuote` / candles / search；`router` 按资产类型与用户 `equityVendor`/`cryptoVendor` 排序并 failover |
| 用户凭证 | `withUserMarket` → ALS；`UserMarketCredential` + `encryptJson` |
| 布局 | `AppShell` + 可折叠 `AppSidebar`；`TopbarIndexTicker`；H5 底栏 |
| 图表 | `CandleChart`（KLineChart）+ 画线工具条 |
| 模拟盘 | `@/lib/trading/*`；Worker 撮合挂单 |
| AI | `@/lib/ai` + `/api/ai/analyze`；约 30 分钟缓存 |

更细设计见 [docs/market-trading-tech.md](./docs/market-trading-tech.md)、[docs/architecture.md](./docs/architecture.md)。

## 常用命令

```bash
npm run dev              # 开发（Turbopack）
npm run build && npm start
npm run worker           # 提醒 + 模拟挂单撮合
npm run db:migrate
npm run lint
```

## 使用说明（产品侧）

1. **注册 / 登录**：邮箱密码；可选 Google / GitHub；登录后可用自选、评论、提醒、模拟交易。
2. **市场页**：切换美股 / 港股 / A 股 / 加密；搜索进详情；爱心加入自选。
3. **详情页**：K 线与指标、报价盘口；右侧模拟买卖；下方 Tab（新闻/财报/公告/公司/高管/评论/情绪/AI）；可设价格提醒。
4. **自选 / Portfolio**：管理关注；查看模拟资金、持仓浮盈、挂单并可重置账户。
5. **提醒**：详情或提醒页设置 ≥ / ≤；需邮件通道 + Worker。
6. **设置**：语言、主题、涨跌色；行情源与 AI Key（BYOK）；邀请码。侧栏右上角可收起为仅图标。

## 文档

| 文档 | 说明 |
|---|---|
| [docs/](./docs/) | 文档中心 |
| [需求](./docs/requirements.md) | 功能范围与验收 |
| [启动与环境](./docs/getting-started.md) | 安装与环境变量 |
| [行情多源与模拟交易](./docs/market-trading-tech.md) | Provider / 撮合 |
| [架构](./docs/architecture.md) · [API](./docs/api.md) · [数据库](./docs/database.md) | 技术细节 |
| [部署](./docs/deployment.md) · [排障](./docs/troubleshooting.md) | 运维 |

## License

Private / 按仓库约定使用。
