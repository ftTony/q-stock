# Q-Stock 需求文档

> 一期全量范围。产品定位：Web 端 + H5 端美股 / 港股 / 数字货币行情系统。

## 1. 项目概述

| 项 | 说明 |
|---|---|
| 产品名 | Q-Stock |
| 形态 | 响应式 Web / H5（同一套 Next.js 应用） |
| 目标用户 | 关注美股、港股与主流加密货币的个人投资者 |
| 一期目标 | 完成行情浏览、K 线指标、资讯评论、用户设置、价格邮件提醒与市场情绪 |

## 2. 技术要求

| 类别 | 选型 |
|---|---|
| 框架 | Next.js 15（App Router）+ TypeScript |
| UI | Tailwind CSS + 深色终端风格主题 |
| 图表 | KLineChart（含画线工具） |
| 国际化 | next-intl（简体中文 / 繁体中文 / English） |
| 主题 | next-themes（亮 / 暗 / 跟随系统）+ 涨跌色方案 |
| 数据库 | PostgreSQL + Prisma |
| 鉴权 | Auth.js（邮箱密码 Credentials + JWT Session） |
| 校验 | Zod |
| 部署 | Docker / Docker Compose（web + db + worker） |
| 行情数据 | 多源：长桥 / 富途 OpenAPI / Finnhub（优先级可配，失败自动回退） |
| 资讯 | Finnhub（新闻 / 财报 / 公告） |
| 情绪 / 舆情 | Adanos Market Sentiment API |
| 邮件 | Resend（优先）或 SMTP / Nodemailer |

## 3. 功能需求

### 3.1 多语言与多主题

- 支持语言：`zh-CN`、`zh-TW`、`en`
- 路由前缀始终带 locale（如 `/zh-CN`、`/en`）
- 主题：浅色 / 深色 / 跟随系统
- 涨跌色：
  - `cn`：红涨绿跌
  - `us`：绿涨红跌
- 用户设置可持久化到数据库，并同步 Session

### 3.2 用户体系

- 邮箱 + 密码注册 / 登录
- 密码最小长度 6
- 用户设置：语言、主题、涨跌色
- 登录后方可：自选、评论、价格提醒、资产概览

### 3.3 市场行情

- 美股 / 港股 / 数字货币 Tab（`assetType`: `stock` | `hk` | `crypto`）
- 热门标的列表、搜索跳转详情（港股内部码为 5 位补零，如 `00700`）
- 涨幅榜 / 跌幅榜筛选
- 静默轮询刷新报价（约 45 秒）
- 显示最近更新时间

### 3.4 自选与资产概览

- 用户自选增删查
- 自选列表带实时报价与 sparkline
- 侧栏展示美股 / 港股 / 加密自选数量
- 一键添加热门标的
- 资产概览页：KPI、自选监控表、新闻叙事、情绪条

### 3.5 个股 / 币种详情

- 报价条（开高低、昨收、涨跌幅）
- 加自选 / 已在自选
- K 线周期：日 K、季 K、年 K
  - 日 K：统一行情门面（长桥/富途/Finnhub）
  - 季 K / 年 K：由日 K 或月 K 本地聚合
- 技术指标：MA / EMA / BOLL / RSI / MACD
- Tab：新闻、财报、公告、评论、情绪、AI 分析
  - 美股财报 Tab：EPS/惊喜%/营收 SVG 图 + 表格；港股：财报 / 公告 / Adanos 情绪暂不接入，UI 友好降级；AI 以新闻+报价为主
- 详情报价盘口：开高低昨收、涨跌、振幅、量/额、买卖一/价差；美股复用财报 metrics（52 周、市值、PE、Beta）
- 右侧模拟交易面板：市价 / 限价 / 止损（仅做多）
- 价格提醒快捷创建（触发价可预填现价）
- 报价约 20 秒轮询

### 3.6 资讯与评论

| 类型 | 数据来源 | 说明 |
|---|---|---|
| 新闻 | Finnhub company-news / market news | 加密以市场新闻过滤 |
| 财报 | Finnhub earnings + calendar + metric | 仅股票：EPS 惊喜（含 SVG 图）、财报日历、关键财务指标；失败降级 |
| 公告 | Finnhub press-releases | 可能受套餐限制；失败降级 |
| 评论 | 本系统自建（PostgreSQL） | 登录可发；作者可软删 |

### 3.7 市场情绪（Adanos）

- 美股：News Stocks / Reddit Stocks 等端点
- 加密：Reddit Crypto
- 市场总览：`/market-sentiment`
- 展示：buzz、sentiment_score、bullish/bearish、趋势条
- 长缓存（约 30 分钟）+ 额度不足时 UI 降级

### 3.8 价格提醒与邮件

- 条件：价格 ≥ 或 ≤ 触发价
- 状态：active / triggered / disabled
- 后台 Worker 轮询活跃提醒，拉取统一 `market.getQuote`
- 触发后发邮件，写投递日志，状态改为 triggered（幂等，不重复发送）
- 邮件通道：Resend 或 SMTP；均未配置时仅打日志

## 4. 页面与导航

| 路由（含 locale） | 说明 |
|---|---|
| `/` | 市场总览仪表盘 |
| `/analysis` | 标的分析入口 |
| `/watchlist` | 我的自选 |
| `/portfolio` | 资产概览 |
| `/alerts` | 价格提醒管理 |
| `/settings` | 用户设置 |
| `/login` / `/register` | 登录注册 |
| `/symbol/[assetType]/[symbol]` | 标的详情 |

布局参考 Quantum Trade 深色终端风格：左侧栏 + 顶栏 + H5 底部导航。

## 5. 数据与接口约定

### 5.1 符号规范

- 股票：如 `AAPL`
- 加密内部存储：`BTC`；请求 Finnhub 映射为 `BINANCE:BTCUSDT`

### 5.2 主要 API（BFF）

| 路径 | 用途 |
|---|---|
| `GET /api/quotes` | 报价 / 热门列表 |
| `GET /api/search` | 搜索 |
| `GET /api/candles` | K 线 + 指标 |
| `GET /api/news` | 新闻 |
| `GET /api/earnings` | 财报 |
| `GET /api/press` | 公告 |
| `GET/POST/DELETE /api/comments` | 评论 |
| `GET /api/sentiment` | Adanos 情绪 |
| `GET/POST/PATCH/DELETE /api/alerts` | 价格提醒 |
| `GET/POST/DELETE /api/watchlist` | 自选 |
| `GET/POST /api/trading/account` | 模拟账户（含 reset） |
| `GET /api/trading/positions` | 模拟持仓 |
| `GET/POST/DELETE /api/trading/orders` | 模拟下单 / 撤单 |
| `GET/PATCH /api/user/settings` | 用户设置 |
| `POST /api/auth/register` | 注册 |
| `GET /api/health` | 健康检查 |

外部 API Key 仅服务端使用，禁止下发浏览器。

## 6. 非功能需求

- **安全**：密码 bcrypt 哈希；密钥环境变量管理
- **性能**：行情 / 新闻 / 情绪短时缓存，降低外部 API 压力
- **可用性**：外部接口限流或套餐不足时降级提示，不整页崩溃
- **兼容**：桌面与移动端可用；移动端侧栏收为抽屉，底部 Tab 导航
- **可运维**：Docker Compose 一键拉起；健康检查接口

## 7. 约束与已知限制

1. 行情源需至少配置长桥 / 富途 / Finnhub 之一；Finnhub 免费档有 rate limit；部分公告 / 基本面接口可能需付费
2. 富途使用云端 OpenAPI（`webapi.futunn.com`）；用户在设置页自带 AppKey+私钥或 Bearer Token（BYOK），无需本机 OpenD
3. 季 K / 年 K 为本地聚合，可能与券商软件存在差异
4. Adanos 免费额度极低，生产建议 Hobby 及以上，并依赖缓存
5. 真实券商撮合预留 `@/lib/broker`（本阶段未接通）；提供**模拟交易**（仅做多），资金为虚拟 `$100,000`

## 8. 验收要点（一期）

- [ ] 三语切换与主题 / 涨跌色生效且可持久化
- [ ] 注册登录后可管理自选、评论、提醒
- [ ] 美股与加密行情、搜索、详情 K 线与指标可用
- [ ] 新闻 / 财报 / 公告 / 评论 / 情绪分区可用（允许降级）
- [ ] 价格提醒触发后能发送邮件（或日志回退）
- [ ] `docker compose up --build` 可启动 web / db / worker
- [ ] 桌面与 H5 主要流程可完成
