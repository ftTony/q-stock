# Proposal

## Why

后台任务仍跑在 Node（`src/workers/price-alerts.ts` + `quote-ws`），与已迁到 FastAPI 的行情/交易/提醒 API 双栈并存，增加运维与凭证解析重复。现把 worker 收拢到 Python，与 `services/api` 共用市场 facade 与小机约束，降低内存与维护成本。

## What Changes

- 新增 Python worker 进程入口（与 API 同包），周期执行：价格提醒发信、模拟限价/止损撮合、自选收盘摘要/推送、美东午夜 sitemap 预写。
- 行情 WebSocket hub（`/ws/quotes`）改为 Python 实现，行为对齐现有订阅/推送语义。
- Compose / `package.json` / Dockerfile：`worker` 镜像改为基于 `services/api` 的 Python 镜像；本地脚本 `dev:worker` 指向 Python。
- **BREAKING（部署）**：生产 `worker` 容器不再跑 `tsx src/workers/price-alerts.ts`；需配置与 API 相同的 DB/Redis/邮件/行情凭证环境变量。
- 策略回放 / lab 任务队列（`tickJobs`）本变更**不完整移植**（逻辑仍深绑 TS）；Python worker 仅保留可插拔钩子或明确降级日志，完整移植列为后续变更。
- TS worker 源码保留一段时间作对照，默认入口切走后标记 deprecated。

## Capabilities

### New Capabilities

- `background-worker`: 后台周期任务（提醒、挂单撮合、digest/push、sitemap）的运行时契约与失败降级。
- `quote-ws`: 浏览器行情 WebSocket 推送服务（端口、启停、订阅与有界推送）。

### Modified Capabilities

- （无）`openspec/specs/` 尚无已归档能力需改 REQUIREMENTS。

## Impact

- 代码：`services/api/app/worker/*`（新）、复用 `services/market` / `trading` / models；`docker-compose.yml` worker 服务；`Dockerfile` worker stage；`package.json` scripts。
- 依赖：`websockets`（或等价）、现有 `cryptography`/httpx/SQLAlchemy；邮件发送需 Python SMTP 或调用既有发送抽象。
- 运行时：小机上仍建议单 worker 进程；quote-ws 与 tick 同进程（对齐现状），用 asyncio 错开 IO。
- 非目标：Celery/Kafka；不在本变更重写策略回放引擎。
