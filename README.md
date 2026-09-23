# Q-Stock

**语言：** [简体中文](./README.md) · [English](./README.en.md) · [繁體中文](./README.zh-TW.md)

美股 / 港股 / 数字货币行情 Web & H5 应用：多源行情、K 线指标、资讯评论、模拟交易、价格邮件提醒与市场情绪。

## 功能亮点

| 模块 | 说明 |
|---|---|
| 行情浏览 | 美股 / 港股 / 加密热门列表、搜索、涨跌榜、静默刷新 |
| 多源行情 | **长桥 → 富途 OpenAPI → Finnhub**（股票/港股）；加密默认 **Binance 公共行情**（无需 Key） |
| 个股详情 | 日/季/年 K（KLineChart）、画线工具、MA / EMA / BOLL / RSI / MACD、详情报价盘口 |
| 资讯 | 新闻、财报（惊喜/日历/财务指标 + EPS/营收 SVG 图）、公告；加密无财报时友好提示 |
| 模拟交易 | 仅做多；市价 / 限价 / 止损；个股右侧下单；Portfolio 资金/持仓/挂单 |
| 自选 & 资产 | 自选 CRUD、sparkline、资产概览 KPI |
| 价格提醒 | 条件触发邮件（Resend / SMTP）；后台 Worker 轮询 |
| 情绪 | Adanos 舆情（长缓存，额度不足时降级） |
| AI 分析 | Vercel AI SDK + DeepSeek；结合新闻 / 财报 / 报价输出看多·中性·看空（约 30 分钟缓存） |
| 体验 | 简/繁/英、亮暗主题、红涨绿跌 / 绿涨红跌 |

技术栈：Next.js 15 · TypeScript · Tailwind · KLineChart · Auth.js · Prisma · PostgreSQL · Docker。

## 环境要求

- Node.js **20+**（推荐 22）
- npm 10+
- Docker（可选，用于 Postgres 或全栈）

至少配置 **一个** 行情源凭证（长桥 / 富途 / Finnhub）。资讯依赖 Finnhub；情绪依赖 Adanos（可选）；AI 分析依赖 `DEEPSEEK_API_KEY`（可选）。

## 快速开始

```bash
cp .env.example .env
# 编辑 .env，至少填写 AUTH_SECRET、DATABASE_URL，以及一个行情源 Key

docker compose up -d db
npm install
npm run db:migrate
npm run dev
```

另开终端启动 Worker（价格提醒 + 模拟限价/止损撮合）：

```bash
npm run worker
```

浏览器打开 [http://localhost:3000](http://localhost:3000)（会进入默认语言 `/zh-CN`）。

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
| `AUTH_SECRET` | 是 | Auth.js 密钥，足够长的随机串 |
| `AUTH_TRUST_HOST` | 建议 | Docker / 反代时设 `true` |
| `DATABASE_URL` | 是 | PostgreSQL 连接串 |

本地 Compose 数据库默认：

```text
postgresql://qstock:qstock@localhost:5432/qstock?schema=public
```

### 行情数据源

| 变量 | 说明 |
|---|---|
| `MARKET_DATA_PROVIDERS` | 优先级 CSV，默认 `longbridge,futu,finnhub`；省略则按已配置凭证自动探测 |
| `LONGBRIDGE_APP_KEY` / `SECRET` / `ACCESS_TOKEN` | [长桥 OpenAPI](https://open.longbridge.com/)，三键齐全即启用 |
| `FUTU_ACCESS_TOKEN` | [富途云端 OpenAPI](https://open.futunn.com/zh-cn/api/overview/) Bearer（推荐，无需 OpenD） |
| `FUTU_APP_KEY` + `FUTU_PRIVATE_KEY` | 富途 Legacy AppKey 签名（可选） |
| `FINNHUB_API_KEY` | Finnhub：回退行情 + 新闻/财报/公告 |

### 其他

| 变量 | 说明 |
|---|---|
| `ADANOS_API_KEY` | 市场情绪；缺失则 UI 降级 |
| `DEEPSEEK_API_KEY` | AI 趋势分析（Vercel AI SDK + DeepSeek）；缺失则 Tab 降级 |
| `DEEPSEEK_MODEL` | 可选，默认 `deepseek-v4-flash` |
| `DEEPSEEK_BASE_URL` | 可选，默认 DeepSeek 官方 API |
| `EMAIL_FROM` / `RESEND_API_KEY` | 提醒邮件（优先 Resend） |
| `SMTP_*` | Resend 不可用时的 SMTP 回退 |
| `ALERT_POLL_INTERVAL_MS` | Worker 轮询间隔，默认 `45000` |

## 常用命令

```bash
npm run dev              # 开发（Turbopack）
npm run build && npm start
npm run worker           # 提醒 + 模拟挂单撮合
npm run db:migrate       # 应用迁移
npm run db:migrate:dev   # 开发期改 schema
npm run lint
```

## 使用说明（产品侧）

1. **注册 / 登录**：邮箱密码；登录后可自选、评论、提醒、模拟交易。
2. **市场页**：切换美股 / 港股 / 加密，搜索进入详情（港股如 `00700`）。
3. **详情页**：看 K 线与指标、详情报价盘口（振幅/量额/买卖一等）；右侧做模拟买卖；下方 Tab 看新闻/财报（含 SVG 图）/公告/评论/情绪/AI 分析。
4. **自选 / Portfolio**：管理关注标的；查看模拟账户资金、持仓浮盈、挂单。
5. **提醒**：详情页或提醒页设置价格 ≥ / ≤ 触发价，需配置邮件通道并由 Worker 运行。
6. **设置**：语言、主题、涨跌色偏好可持久化。

模拟交易初始资金 **$100,000**（仅做多）；可在 Portfolio 重置账户。真实券商下单接口已预留，尚未接通。

## 文档

| 文档 | 说明 |
|---|---|
| [docs/](./docs/) | 文档中心 |
| [需求](./docs/requirements.md) | 功能范围与验收 |
| [启动与环境](./docs/getting-started.md) | 更细的安装与排错 |
| [行情多源与模拟交易实现思路](./docs/market-trading-tech.md) | Provider / 撮合设计 |
| [架构](./docs/architecture.md) · [API](./docs/api.md) · [数据库](./docs/database.md) | 技术细节 |
| [部署](./docs/deployment.md) · [排障](./docs/troubleshooting.md) | 运维 |

## License

Private / 按仓库约定使用。
