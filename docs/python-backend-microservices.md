# Python 后端演进：多端 API、Redis、Kafka 与微服务

> 规划文档，描述目标架构与分期路径，**不等于当前生产已落地**。  
> 现网仍是 Next.js BFF + Node Worker + PostgreSQL，见 [architecture.md](./architecture.md)、[deployment.md](./deployment.md)。

## 1. 背景与目标

Q-Stock 需要同时服务：

- Web（Next.js：页面与 SEO）
- Android / iOS
- QT 桌面端

因此后端目标是：

1. **唯一业务 API 层用 Python**（客户端不依赖 Next `src/app/api/*`）。
2. 契约统一：**OpenAPI 3 + JWT Bearer**，各端可生成 SDK。
3. 在流量与机器预算到位后，引入 **Redis、Kafka、微服务**，把行情缓存、异步任务与领域服务解耦。
4. 密钥、券商凭证、AI Key、BYOK 解密**只在服务端**；客户端永不直连券商 / Finnhub / AI 厂商。

产品闭环（看盘 → 分析 → 模拟 → 复盘 / 规则回放）不变；本文件只谈技术演进，不改产品主张。策略方向见 [strategy-backtest-direction.md](./strategy-backtest-direction.md)。

## 2. 与现状的差距

| 维度 | 现状 | 目标 |
|---|---|---|
| HTTP API | Next Route Handlers（`src/app/api/**`） | FastAPI 微服务 / 模块化单体，`/api/v1` |
| 鉴权 | Auth.js JWT（偏 Web Cookie 会话） | access + refresh，全端 `Authorization: Bearer` |
| ORM | Prisma | SQLAlchemy 2 async + Alembic（表结构兼容演进） |
| 缓存 | 进程内有界缓存 + DB `ApiCache` | Redis（短 TTL、限流、会话吊销） |
| 异步任务 | Postgres 行状态队列 + Node Worker 轮询 | Kafka 事件 + Python Worker；过渡期可双轨 |
| 实时行情 | Node `quote-ws`（`:3001`） | `quote-gateway`（Python WS） |
| 部署 | Compose：`web` + `worker` + `db`（约 1GB 主机） | 分期加 `redis` / `kafka` / 多服务；轻量档与全量档分离 |
| 前端 | UI + BFF | 仅 UI / SSR / SEO |

**硬约束：** 当前小机规则（[small-server](../.cursor/rules/small-server.mdc)）仍然有效。不要在 **1GB / 1 核** 上同机拉起 Kafka 多 broker + 全套微服务；中间件与拆分按下面分期引入。

## 3. 目标逻辑架构

```text
                    Web / Android / iOS / QT
                              │
                    ┌─────────┴─────────┐
                    │   API Gateway     │  TLS / 路由 / 限流 / 鉴权透传
                    │ (Nginx/Caddy/… )  │
                    └─────────┬─────────┘
           ┌──────────┬───────┼───────┬──────────┐
           ▼          ▼       ▼       ▼          ▼
        auth       market  trading  strategy   ai-review
           │          │       │       │          │
           │          └───────┼───────┘          │
           │                  ▼                  │
           │            ┌──────────┐             │
           └───────────►│ Postgres │◄────────────┘
                        └──────────┘
                              ▲
           Redis ◄────────────┤────────────► Kafka
             │                │                 │
             │         quote-gateway            │
             │         (WebSocket)              ▼
             └──────────────►│◄────────── notify / strategy-worker
```

客户端同步读走 Gateway → 各服务；实时行情可直连 `quote-gateway`（`wss://…/ws/v1/quotes`）。异步链路经 Kafka，避免在请求路径上做回测、扇出告警、重建 SEO。

## 4. 服务职责与数据归属

按现有代码域拆分，避免按「技术层」乱切。

| 服务 | 职责 | 今日对照 | 主数据 |
|---|---|---|---|
| **auth-user** | 注册登录、OAuth、刷新/吊销、用户设置、邀请、凭证元数据 | `src/lib/auth`、`/api/user/*` | User、Session/Refresh、Invite、Credential 元数据 |
| **market** | 行情 facade、K 线、搜索、排行、新闻/公司/财报等 | `src/lib/market`、`/api/quotes|candles|…` | 可选行情快照缓存；权威仍以外部源 + 短缓存为准 |
| **trading** | 纸面账户、订单、风控、撮合结果写入 | `src/lib/trading` | Account、Position、Order、Fill、RiskSettings |
| **strategy** | 策略 CRUD、回测入队、报告查询、实验室任务 | `src/lib/strategy` | Strategy、Replay、LabReport |
| **ai-review** | 个股分析、复盘解读、配额 | `src/lib/ai`、`src/lib/review` | AI 会话/配额、Review 摘要引用 |
| **notify** | 价格提醒邮件、收盘 digest | Worker 告警/摘要 | Alert 规则与发送记录 |
| **quote-gateway** | WebSocket 订阅与推送 | `src/workers/quote-ws.ts` | 无强持久化；读 Redis / 消费 Kafka |
| **gateway** | 对外统一入口（早期可用反向代理代替独立服务） | Cloudflare Tunnel 路由 | 无 |

原则延续现网：

- `MARKET_DATA_PROVIDERS` + 用户 `equityVendor` / `cryptoVendor`；**环境变量 Key 优先于 BYOK**。
- 扶摇（fuyao）不参与 failover。
- 真实券商下单（`broker`）仍为 stub，不在本规划范围内落地实盘。

### 4.1 数据库策略

- **S1–S3：** 共享一个 PostgreSQL，Schema 按域分表或分 schema，迁移统一由 Alembic（或过渡期明确「只允许一侧写迁移」）。
- **S4+：** 允许按服务拆库，但需先有清晰边界与同步事件；不要为了微服务而过早拆库。
- 从 Prisma 迁到 SQLAlchemy 时：**表结构兼容、不重建库**；双写窗口尽量短。

## 5. Redis 设计

### 5.1 用途

| 用途 | Key 形态（示例） | TTL / 边界 |
|---|---|---|
| 行情 / 搜索短缓存 | `mkt:q:{symbol}`、`mkt:cndl:{symbol}:{tf}` | 秒～分钟级；必须设 TTL；禁止无界增长 |
| 接口限流 | `rl:{route}:{userOrIp}` | 固定窗口或滑动窗口 |
| 登录防刷 | `auth:fail:{emailOrIp}` | 短 TTL + 阈值上限 |
| Refresh 吊销 / 会话版本 | `auth:rt:{jti}` 或 `auth:ver:{userId}` | 与 refresh 生命周期一致 |
| 回测幂等 / 进行中锁 | `strat:replay:lock:{id}` | 任务超时自动释放 |
| WS 本机扇出（小规模） | Pub/Sub channel `quotes:{symbol}` | 大规模改走 Kafka |

### 5.2 客户端与运维

- 使用 `redis.asyncio`；连接池有上限。
- 生产建议 `maxmemory` + `allkeys-lru`（或按业务分 DB/前缀淘汰策略）。
- 缓存只做加速，**行情与成交真相不以 Redis 为准**。
- 小机若暂时不部署 Redis：保留现有进程内有界缓存，接口契约不变，便于日后切换。

## 6. Kafka 设计

### 6.1 何时引入

- 回测 / 告警 / 成交后处理开始拖慢 API 或 Worker 轮询不够用。
- 需要多消费者独立扩缩（例如行情一分给 WS、一分给告警）。
- **不要**在单机 1GB 上为「架构完整」强行上 Kafka；开发机用 Compose `profile: full`，生产轻量档可不用。

### 6.2 Topic 初稿

| Topic | 生产者 | 消费者 | 说明 |
|---|---|---|---|
| `market.quotes.tick` | market / 采集任务 | quote-gateway、notify | 报价更新；注意频率与压缩 |
| `trading.orders.filled` | trading | ai-review、notify、（可选）strategy | 模拟成交事件 |
| `strategy.replay.requested` | strategy API | strategy-worker | 回测入队 |
| `strategy.replay.completed` | strategy-worker | （可选）notify、审计 | 结果就绪通知 |
| `notify.alerts` | notify 或规则引擎 | notify-sender | 触达投递 |
| `audit.api` | gateway / 各服务 | 审计落地（可选） | 低频审计 |

### 6.3 约定

- 消息带 `event_id`、`occurred_at`、`schema_version`；消费者**幂等**（以 `event_id` 或业务主键去重）。
- 载荷优先 JSON + 文档化 schema；流量大后再评估 Avro/Protobuf。
- 回测类任务：Kafka 传「任务引用」（replay id），大结果仍落 Postgres / 对象存储，避免巨型消息。
- 过渡期可保留现有 **Postgres 行状态队列**（`StrategyReplay` pending→running→done），Worker 同时支持「扫表」与「消费 Kafka」，切稳后再停扫表。

## 7. 鉴权与多端接入

```text
登录/注册/OAuth ──► auth-user ──► access_token（短）+ refresh_token（长）
各端请求 ──► Authorization: Bearer <access_token>
access 过期 ──► /api/v1/auth/refresh ──► 新 token 对
登出 / 改密 ──► 吊销 refresh（Redis 黑名单或会话版本号 +1）
```

| 客户端 | 建议 |
|---|---|
| Web | 统一 API Client；refresh 可用 HttpOnly Cookie **或** 内存 + 安全存储，与原生策略对齐文档 |
| Android / iOS | 系统密钥链 / Keystore 存 refresh |
| QT | 系统凭据存储或加密本地存储；禁止明文配置文件长期放 token |

OAuth（Google / GitHub）：由 **auth-user** 完成 code 交换并签发自家 JWT；Next Auth.js 在 API 迁完后退役。

Gateway 可校验 JWT 签名并转发 `X-User-Id`；各服务仍应二次校验或信任内网 mTLS，按部署安全级别选择，文档默认：**服务内验证 JWT 或内网签发的 user context**。

## 8. API 契约与版本

- 前缀：`/api/v1/...`；破坏性变更走 `/api/v2`。
- 错误体统一：

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests",
    "details": {}
  }
}
```

- 列表：`limit` 有服务端上限；优先 cursor 分页。
- WebSocket：`/ws/v1/quotes`；连接后 Bearer 或首帧 token 鉴权。
- OpenAPI 由 FastAPI 生成；**建议 CI 对 OpenAPI diff**，防止无意破坏移动端 / QT。
- 现有 HTTP 一览见 [api.md](./api.md)；迁徙过程中该文档改为「指向 OpenAPI + 变更说明」。

## 9. 推荐技术栈（已定）

| 层 | 选型 |
|---|---|
| HTTP | FastAPI + Pydantic v2 + Uvicorn |
| ORM | SQLAlchemy 2（async）+ Alembic |
| 缓存 | Redis（`redis.asyncio`） |
| 消息 | Kafka（`aiokafka` 或 confluent-kafka，团队择一并写进服务模板） |
| 任务进程 | 独立 Python worker 进程（消费 Kafka / 扫库） |
| 网关 | 早期 Traefik / Caddy / Nginx / Cloudflare Tunnel；后期可独立 gateway 服务 |
| Web | Next.js（仅 UI / SSR / SEO） |

不在首期引入：Celery 全家桶与 K8s（可在 S4+ 按运维能力再评估）。若仅需轻量队列且暂不上 Kafka，S2 可用 Redis Stream / 有界列表，但目标态事件总线以 Kafka 为准，避免两套语义长期并存。

## 10. 仓库与 Compose 形态（目标）

```text
apps/
  web/                          # Next UI + SEO
services/
  gateway/                      # 可选
  auth/
  market/
  trading/
  strategy/
  ai_review/
  notify/
  quote_gateway/
infra/
  docker-compose.yml            # 默认或 profile
  docker-compose.lite.yml       # 无 Kafka：api 单体 + redis? + db + web
  redis/ kafka/                 # 配置示例
docs/
  python-backend-microservices.md
  architecture.md
  api.md
  deployment.md
```

**Compose profile 建议：**

- `lite`：Postgres +（可选 Redis）+ 模块化单体 `api` + `worker` + `web` — 接近可上小机。
- `full`：再加 Kafka（单 broker 仅限开发）、按服务拆容器 — 本地联调事件流。

S1 落地前，也可先在仓库增加 `services/api` 单体目录，内部按包划分 `auth` / `market` / …，与日后拆仓/拆进程对齐。

## 11. 分期迁移

### S0 — 文档与契约（本文件）

- 锁定 OpenAPI / JWT / 错误体约定。
- 明确非目标与小机约束。

### S1 — 模块化单体 FastAPI

- 一个 API 进程 + Postgres；目录按域分包。
- JWT 登录闭环；Next 改为调用 Python；按域删除 Next `route.ts`（auth → market → trading/strategy → AI）。
- Worker 可用 Python 重写现有 tick（告警、撮合、replay drain、sitemap），**仍可用 DB 队列**。
- 机器：按实测设内存上限；遵守列表 cap、回测异步、SEO 预写盘。

### S2 — 引入 Redis

- 缓存、限流、refresh 吊销。
- API / Worker 配置 Redis；无 Redis 时降级到进程内缓存（fail soft）。

### S3 — 引入 Kafka + 独立 Worker

- `strategy.replay.*`、`trading.orders.filled`、`notify.*` 先行。
- strategy-worker、notify-worker 独立部署与扩缩。
- DB 行队列与 Kafka 双轨，切稳后停扫表。

### S4 — 拆微服务

- 优先拆 **market**（外部 IO）与 **strategy**（CPU），再拆 auth / trading / ai-review。
- Gateway 统一对外；服务间同步调用要有超时与降级。
- 评估是否拆库。

### S5 — 多端 SDK

- OpenAPI 生成 Android / iOS / QT 最小示例（登录 + quotes）。
- Web 与原生共用同一 `baseURL` 与版本策略。

### 每阶段退出标准（摘要）

| 阶段 | 可上线信号 |
|---|---|
| S1 | Web 完成登录 → 行情 → 模拟下单 → 回测入队查询；业务 API 不再经 Next |
| S2 | 热点行情命中 Redis；限流生效；吊销 refresh 立即失效 |
| S3 | 回测与告警经 Kafka；API 进程 OOM/重启不影响已入队任务消费（在预算机器上） |
| S4 | market / strategy 可独立扩缩；故障隔离可演示 |
| S5 | 至少一端原生或 QT 用生成客户端跑通主路径 |

## 12. 风险与回滚

| 风险 | 缓解 |
|---|---|
| 1GB 同机中间件 OOM | lite 档默认；Kafka/多服务仅 full 或独立主机 |
| 双栈（Next API + Python）长期并存 | 按域切换，切完即删 Next 路由；禁止无期限双写 |
| Prisma / Alembic 双迁移 | 明确单一写方；另一侧只读或冻结 |
| Kafka 运维复杂 | S3 前用 DB 队列；开发用单 broker；生产评估托管 Kafka |
| 缓存脏读 | 短 TTL；成交与账户以 DB 为准；写路径先 DB 再删缓存 |
| 过早拆服务导致延迟与级联失败 | S1 模块化单体优先；同步调用一律超时、熔断、降级 |

回滚示例：关掉 Kafka 消费者，Worker 恢复扫 `StrategyReplay` 表；去掉 Redis 后走进程内缓存。契约层（URL / JWT）尽量保持稳定，便于回滚基础设施而不回滚客户端。

## 13. 非目标

- 不用 Python 模板重写 Next 页面。
- 首期不落地实盘券商交易。
- 不为「技术雷达齐全」在小机同进程/同机塞满 Redis + Kafka + 十余容器。
- 不复制外部量化平台的巨型因子 / 多 Agent 执行架构；回测仍以确定性规则引擎与产品分期为准。

## 14. 相关文档

- [architecture.md](./architecture.md) — 当前生产架构
- [deployment.md](./deployment.md) — 当前 Compose 与上线清单
- [api.md](./api.md) — 当前 HTTP API
- [database.md](./database.md) — 数据模型
- [prd/strategy-and-backtest.md](./prd/strategy-and-backtest.md) — 策略与回测产品范围
- [strategy-backtest-direction.md](./strategy-backtest-direction.md) — 产品方向补充
