# Design

## Context

现状：Compose `worker` 跑 Node `tsx src/workers/price-alerts.ts`，同进程挂 `quote-ws`（`ws` + `lib/market/stream/hub`）。行情/交易/提醒 CRUD 已在 FastAPI；提醒发信、digest、sitemap、策略 `tickJobs` 仍依赖 TS（Prisma + `src/lib/*`）。小机 1GB/1 vCPU，不宜再叠 Celery。动机见 `proposal.md`。

## Goals / Non-Goals

**Goals:**

- 单一 Python 进程：`asyncio` 周期 tick + 可选 quote-ws。
- 复用 `services/api` 的 DB、market facade、trading fill、settings。
- Compose/本地脚本切换到 Python worker，行为对齐现有间隔与批量上限。

**Non-Goals:**

- 不移植策略回放/lab 完整引擎（后续变更）。
- 不上 Kafka/Celery；不把 tick 塞进 FastAPI 请求路径。
- 不在本变更删除全部 TS worker 源码（可 deprecate）。

## Decisions

### 1. 包位置：`services/api/app/worker/`

- 入口：`python -m app.worker`（`app/worker/__main__.py`）。
- 子模块按任务拆分：`loop.py`、`alerts_tick.py`、`paper_tick.py`、`digest_tick.py`、`push_tick.py`、`sitemap_tick.py`、`quote_ws.py`，单文件保持 &lt;500 行。
- **备选**：独立 `services/worker` 仓 — 否决：与 API 共享代码需复制或可编辑安装，小仓不值。

### 2. 并发模型：asyncio + 有界 gather

- tick 内子任务顺序或轻度并发，但行情拉取按用户串行/有界并发（对齐「别风暴」）。
- quote-ws 用 `websockets` 库与 tick 同 event loop。
- **备选**：多线程 — 否决：与 async SQLAlchemy/httpx 叠床架屋。

### 3. 邮件

- 实现轻量 SMTP（env：`SMTP_*` / 复用现有 Next 侧同类变量名若已有）或 `aiosmtplib`；提醒 HTML 模板做最小中英静态模板。
- digest 若依赖复杂 HTML：先移植「窗口判断 + 有用户才发」骨架，模板可先纯文本降级，再迭代对齐。

### 4. quote-ws 语义

- 协议尽量对齐现有 hub：订阅/退订 JSON 消息、推送 quote 快照；订阅上限与 poll 间隔用 env（沿用或镜像 `QUOTE_*`）。
- 推送数据走已有 Python `get_quote` / market facade + 用户凭证上下文（若协议含 user，否则平台 env）。

### 5. 部署切换

- Dockerfile：新增/改用 `services/api` 的 worker stage（`CMD python -m app.worker`），Compose `worker` 指向该镜像；端口 3001 保留。
- `package.json`：`worker` → `cd services/api && python -m app.worker`；保留 `worker:node` 应急。
- 策略 jobs：tick 内 `logger.warning("strategy jobs not ported")` 一次/进程或低频，满足 spec 降级。

### 6. 配置

- `ALERT_POLL_INTERVAL_MS`（或秒）继续支持；`QUOTE_WS_PORT` / `QUOTE_WS_ENABLED`；sitemap/digest 开关与 TS 同名 env，写入 `Settings` 或 worker 本地读取 `os.environ`。

## Risks / Trade-offs

- **策略任务暂停**：规则实验室回放在切换后可能积压 — 接受并在 docs/CHANGELOG 标明；紧急可临时 `worker:node`。
- **邮件/digest 视觉差**：首版模板可能简陋 — 功能优先，后续对齐。
- **quote-ws 协议细微差**：前端若依赖精确字段，需对照 `hub.ts` 做契约测试。
- **双 worker 误启**：文档强调勿同时跑 Node+Python worker 以免重复发信/双成交。

## Migration Plan

1. 实现 Python worker + 本地 `python -m app.worker` 验证 tick/报价端口。
2. 改 Compose/Dockerfile；预发只起 Python worker。
3. 观察提醒/挂单/WS；策略队列若有积压再开 follow-up。
4. 稳定后 archive；TS worker 标 deprecated。

## Open Questions

- 生产 SMTP 是否已有统一 env 命名（对照 `.env.example` 落地时核对）。
- digest/close-push 是否必须首版像素级对齐邮件 — 默认「可发送的最小可用」。
