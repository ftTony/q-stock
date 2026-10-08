# Q-Stock 需求文档

> 与当前代码库对齐的功能范围。产品定位：Web + H5 美股 / 港股 / **A 股** / 数字货币行情系统。

## 1. 项目概述

| 项 | 说明 |
|---|---|
| 产品名 | Q-Stock（界面品牌亦可能显示「钱力股 / Qianli Gu」） |
| 形态 | 响应式 Web / H5（同一套 Next.js 应用） |
| 目标用户 | 关注美股、港股、A 股与主流加密货币的个人投资者 |
| 目标 | 行情浏览、K 线指标、资讯评论、用户设置、价格邮件提醒、市场情绪、模拟交易与 AI 分析 |

## 2. 技术要求

| 类别 | 选型 |
|---|---|
| 框架 | Next.js 15（App Router）+ TypeScript |
| UI | Tailwind CSS；亮/暗主题 |
| 图表 | KLineChart（含画线工具） |
| 国际化 | next-intl：**10 语言**；默认 `en`，**URL 无前缀**（`/`、`/login`）；其它语言带前缀（`/zh-CN/...`）。用户偏好入库仅 `zh-CN`/`zh-TW`/`en`，其余映射为 `en` |
| 主题 | next-themes（亮 / 暗 / 跟随系统）+ 涨跌色 `cn` / `us` |
| 数据库 | PostgreSQL + Prisma |
| 鉴权 | Auth.js：邮箱密码 Credentials + JWT；可选 Google / GitHub OAuth |
| 校验 | Zod |
| 部署 | Docker Compose（web + db + worker） |
| 行情 | 多源 facade + failover；平台 **env Key 优先**，否则用户 **BYOK**（加密存库） |
| 资讯 | Finnhub + 长桥/富途内容接口（个股新闻等） |
| 情绪 | Adanos |
| AI | Vercel AI SDK；用户多厂商 BYOK 或平台 DeepSeek |
| 邮件 | Resend（优先）或 SMTP |

## 3. 功能需求

### 3.1 多语言与多主题

- 默认英文无 locale 前缀；非英文路由带 locale 前缀
- 主题与涨跌色可持久化（Session + DB）
- 桌面侧栏可收起为仅图标（`localStorage`）

### 3.2 用户体系

- 邮箱 + 密码注册 / 登录（密码 ≥ 6）；找回 / 重置密码
- 可选 OAuth（配置对应 env 后启用）
- 邀请码注册（设置页可生成/管理）
- 登录后方可：自选、评论、价格提醒、模拟交易、保存 BYOK

### 3.3 市场行情

- Tab：`stock` | `hk` | `cn` | `crypto`
- 热门 / 涨幅 / 跌幅；搜索进详情（港股内部 5 位码如 `00700`）
- KPI、行业热力（非加密）、港股 IPO 面板、情绪条（A 股市场页可隐藏叙事新闻）
- 顶栏指数轮播（美/港/A 轮换，约 5s；数据约 60s 刷新）
- 静默刷新约 45s；爱心图标加自选

### 3.4 自选与资产概览

- 自选增删查，含 `cn` 过滤
- sparkline + 实时报价
- Portfolio：模拟账户 KPI、持仓、挂单、成交、重置；侧栏新闻/情绪

### 3.5 个股 / 币种详情

- 紧凑报价头（返回、代码、名称、价、涨跌、时间）+ 爱心自选；滚动后吸顶迷你条
- K 线：日 / 季 / 年；指标 MA / EMA / BOLL / RSI / MACD；左侧画线工具
- 详情报价盘口
- 右侧模拟交易面板（市价 / 限价 / 止损，仅做多）
- 价格提醒表单
- Tab：新闻、财报、公告、公司简介、高管、评论、情绪、AI 分析（加密财报等友好降级）

### 3.6 资讯与评论

| 类型 | 数据来源 | 说明 |
|---|---|---|
| 个股新闻 | 长桥 → 富途 → Finnhub | 见 `src/lib/news.ts` |
| 市场新闻 | Finnhub 等 | 市场页叙事区 |
| 财报 / 公告 / 基本面 | Finnhub（及券商内容接口） | 失败降级 |
| 评论 | PostgreSQL | 登录可发；作者可软删 |

### 3.7 市场情绪（Adanos）

- 美股 / 加密等端点；长缓存；额度不足 UI 降级
- 港股等场景可降级展示

### 3.8 AI 分析

- `/api/ai/analyze`：结合新闻/财报/报价 → 看多 / 中性 / 看空
- 约 30 分钟缓存；用户设置页 Key 优先于平台 `DEEPSEEK_*`

### 3.9 价格提醒与邮件

- 条件 ≥ / ≤；状态 active / triggered / disabled
- Worker 拉 `market.getQuote`，发信后幂等置 triggered
- Resend 或 SMTP；未配置则仅日志

### 3.10 模拟交易

- 初始现金 **$100,000**；仅做多
- 市价立即成交；限价/止损由 Worker 撮合
- 真实券商 `@/lib/broker` 仍为 stub

### 3.11 设置与凭证

| 项 | 说明 |
|---|---|
| 偏好 | 语言、主题、涨跌色、显示名 |
| 股票源 | 优先长桥或富途；对应 BYOK 表单 |
| 加密源 | 优先 Binance 或 OKX；OKX 可填 Key |
| AI | DeepSeek / OpenAI 兼容 / Gemini / Anthropic |
| 扶摇 | 代码保留，**设置页不展示**；路由层禁用 |
| 平台 env | 有则全站优先于 BYOK |

## 4. 页面与导航

| 路由（含 locale） | 说明 |
|---|---|
| `/` | 市场总览 |
| `/analysis` | 标的分析入口 |
| `/watchlist` | 自选 |
| `/portfolio` | 资产 / 模拟账户 |
| `/alerts` | 价格提醒 |
| `/settings` | 设置 |
| `/about` | 关于 / 联系 |
| `/login` `/register` `/forgot-password` `/reset-password` | 鉴权 |
| `/symbol/[assetType]/[symbol]` | 标的详情 |

布局：左侧可折叠导航 + 顶栏（指数轮播 / 操作）+ H5 底部 Tab。

## 5. 数据与接口约定

### 5.1 符号

- 美股：`AAPL`；港股：`00700`；A 股按券商/Finnhub 映射；加密内部 `BTC`

### 5.2 主要 BFF（节选）

| 路径 | 用途 |
|---|---|
| `GET /api/quotes` `/api/ranks` `/api/indices` `/api/search` `/api/candles` | 行情 |
| `GET /api/news` `/api/earnings` `/api/press` … | 资讯 |
| `GET /api/sentiment` | 情绪 |
| `POST /api/ai/analyze` | AI |
| `GET/POST/DELETE /api/watchlist` `/api/alerts` `/api/comments` | 用户数据 |
| `GET/POST /api/trading/*` | 模拟交易 |
| `GET/PUT/DELETE /api/user/market-credentials` | BYOK |
| `GET/PUT /api/user/service-credentials` | AI 等服务 Key |
| `GET/PATCH /api/user/settings` | 偏好 |
| `GET /api/health` | 健康与 provider 状态 |

外部 Key 仅服务端使用。

## 6. 非功能需求

- **安全**：密码 bcrypt；BYOK AES-GCM（`CREDENTIALS_ENCRYPTION_KEY`）
- **性能**：行情/新闻/情绪短时缓存
- **可用性**：源失败 failover；套餐不足 UI 降级
- **兼容**：桌面侧栏 + H5 底栏
- **可运维**：Compose；`/api/health`

## 7. 约束与已知限制

1. 至少一种行情路径可用（env 或 BYOK 或 Finnhub/币安公共）
2. 富途为云端 OpenAPI，无需 OpenD
3. **扶摇当前禁用**（`isProviderEnabled("fuyao") === false`）
4. 季 K / 年 K 本地聚合，可能与券商软件有差异
5. Adanos 免费额度低，依赖长缓存
6. 真实下单未接通；仅模拟盘
7. DB 语言枚举仅三语，其它 UI 语言偏好回落为 `en`

## 8. 验收要点

- [ ] 多语言与主题 / 涨跌色可用
- [ ] 邮箱注册登录；可选 OAuth（若配置）
- [ ] 美股 / 港股 / A 股 / 加密行情与详情 K 线可用
- [ ] 自选爱心、侧栏收起、指数顶栏正常
- [ ] 新闻 / 财报 / 评论 / 情绪 / AI 可用（允许降级）
- [ ] 模拟交易与价格提醒（邮件或日志）
- [ ] `docker compose up --build` 可启动
- [ ] 桌面与 H5 主流程可完成
