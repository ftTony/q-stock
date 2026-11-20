# Tasks

## 1. Worker 骨架与配置

- [x] 1.1 新增 `app/worker/` 包与 `__main__.py`：读 `ALERT_POLL_INTERVAL_MS` / quote-ws env，启动 asyncio 主循环
- [x] 1.2 将 worker 相关 env 接到 `Settings` 或 worker 本地配置辅助（间隔、WS 开关/端口、digest/sitemap 开关）
- [x] 1.3 子任务错误隔离：单 tick 内 try/except + 结构化日志，进程不因单任务退出

## 2. 提醒与模拟撮合

- [x] 2.1 TDD：移植阈值阈值判定 / re-arm 规则（对齐 `src/lib/alerts/threshold`）
- [x] 2.2 实现 `alerts_tick`：有界查询 PriceAlert、按用户拉行情、发信、写 AlertDeliveryLog、更新状态
- [x] 2.3 实现最小 SMTP/提醒邮件发送（复用 `.env` 既有邮件相关变量名；无配置则打日志跳过发送但仍可更新状态的策略需在实现中明确且可测）
- [x] 2.4 TDD：限价/止损触发判定；实现 `paper_tick` 调用 trading fill / reject

## 3. Digest / Push / Sitemap

- [x] 3.1 移植美东收盘窗口与午夜窗口判定（对齐 `session` 语义）
- [x] 3.2 实现 digest / close-push 最小可用版本（窗口外 no-op；窗口内有界用户处理）
- [x] 3.3 实现每日 sitemap 写入（目录来自 env；同日幂等）

## 4. Quote WebSocket

- [x] 4.1 实现 `/ws/quotes` 服务：启停受 `QUOTE_WS_ENABLED` 控制
- [x] 4.2 订阅上限 + 推送循环；对照现有 hub 消息形状做联调/契约笔记
- [x] 4.3 单标的行情失败不影响其它订阅与进程

## 5. 部署与脚本切换

- [x] 5.1 Dockerfile worker stage 改为 Python（基于 `services/api`）；Compose `worker` 对齐端口 3001 与卷
- [x] 5.2 `package.json`：`worker` 指向 `python -m app.worker`；保留 `worker:node` 应急
- [x] 5.3 策略 `tickJobs`：显式降级日志（本变更不移植引擎）
- [x] 5.4 更新 `docs/architecture.md` 中 worker 入口描述

## 6. 验证

- [x] 6.1 本地启动 worker：确认 tick 日志与（若启用）WS 监听
- [x] 6.2 用测试/手工路径验证提醒触发或挂单成交路径至少一条
- [x] 6.3 确认未同时跑 Node worker（文档/脚本注释提醒）

## Workflow follow-up

- 用户确认后走 `openspec-write-plan` 或 `openspec-apply-change` 实现
- 完成后 `openspec-archive-change`
- 后续变更：策略 replay/lab 完整 Python 化；digest 邮件模板像素对齐；web-push 实发
