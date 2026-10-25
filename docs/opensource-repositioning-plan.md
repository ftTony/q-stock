# Q-Stock 开源 + 定位转型规划

> 目标：把 q-stock 从「公开行情站」转型为 **开源自托管行情面板（Self-hosted Market Dashboard, BYOK-first）**，
> 规避行情转发合规风险，把 UCloud 流量成本压到可控，同时积累开源影响力。

---

## 0. 转型后的定位一句话

> **「一个你可以自己部署的多市场行情面板：股票/加密行情、K 线指标、价格提醒、模拟交易、AI 分析——数据凭证全部由你自己提供（BYOK），平台不存、不转发行情。」**

目标用户：开发者 / 极客 / 有券商 API 的个人投资者（自托管圈层）。
演示站（q-stock.cn）只做「产品橱窗」，不再是服务主体。

---

## Phase 0 · 清理与安全（1~2 天，必须最先做）

开源前一次性处理干净，**顺序不能反**——先清历史，再公开仓库。

| # | 事项 | 说明 |
|---|---|---|
| 0.1 | 密钥资产出库 | `q-stock-origin.key` / `q-stock-origin.pem` 移出仓库目录；若 git 历史中出现过，视为已泄露，**立即轮换 UCloud SSH 密钥与 Cloudflare Tunnel 凭证** |
| 0.2 | 审计 git 历史 | `git log --all --diff-filter=A -- .env* '*.key' '*.pem'`；有泄露 → 用 `git filter-repo` 重写历史，或直接 squash 成全新初始提交（推荐后者，省事且干净） |
| 0.3 | 排查硬编码凭证 | 全局搜 `app_key` / `secret` / `access_token` / `sk-` 等；长桥/富途/币安/OKX/DeepSeek/Resend 的 Key 全部轮换一遍 |
| 0.4 | 删除扶摇残留 | README 已注明路由层屏蔽——开源版直接物理删除扶摇客户端代码，减少维护面 |
| 0.5 | 敏感 docs 移出 | `cdn-performance-diagnosis.md`、`product-opportunity-brainstorm.md` 等含部署细节/商业思考的文档，移到私有目录，不进公开仓库 |
| 0.6 | `data/`、`debug.log`、`*.tsbuildinfo` 确认在 `.gitignore` | 示例数据改成 `data/.gitkeep` + 少量脱敏样本 |

**License 决策**：推荐 **AGPL-3.0**。
- 防止别人 fork 后直接开商业托管站（你的核心顾虑场景）；
- 想最大化传播可退一步用 Apache-2.0，但会失去「闭源 SaaS 必须回馈」的约束。
- 折中方案：AGPL-3.0 + 商业双授权（联系邮箱谈），常见开源商业化姿势。

---

## Phase 1 · 合规切割（2~3 天）

原则：**公开能看到的只有加密行情；股票行情必须登录 + BYOK；日志不落转发痕迹。**

| # | 事项 | 说明 |
|---|---|---|
| 1.1 | 行情访问分级 | 未登录：仅加密行情（Binance/OKX 公开接口，合规风险最低）；登录且配置 BYOK：解锁股票行情 |
| 1.2 | 平台 env 兜底移除 | `resolve-market-creds.ts` 的「服务端 env 优先」逻辑在开源版去掉或加 `ALLOW_PLATFORM_QUOTES=false` 开关——平台代拉行情正是风险来源 |
| 1.3 | 演示站降级 | q-stock.cn 未登录只展示 crypto 行情 + 截图区 + 「Deploy your own」按钮；股票页面直接 302 到说明页 |
| 1.4 | ToS 声明 | README 与站内 footer 加：「本项目不提供任何行情数据，行情来自用户自行配置的第三方服务凭证」 |

---

## Phase 2 · 流量与成本改造（3~5 天，与 Phase 1 可并行）

公开演示站只承担「橱窗」职能后，流量压力天然下降 80%；剩下的是自托管用户自己的服务器，成本与运营者无关。演示站本身：

| # | 事项 | 说明 |
|---|---|---|
| 2.1 | WS 按需订阅 | `src/workers/quote-ws.ts` 推送链路改为：客户端只订阅当前页面可见标的（IntersectionObserver），离开视口自动退订 |
| 2.2 | 推送节流 | 同一标的合并到 1~3s 一个 tick 再推；演示站可固定 5s |
| 2.3 | SSE 降级 | 弱网/不支持 WS 时降级为 SSE 或 45s 轮询 |
| 2.4 | 迁移评估 | 演示站前端评估迁 Vercel/Cloudflare Pages（免费额度足够橱窗流量），UCloud 只留 Postgres + Worker |

---

## Phase 3 · 开源体验建设（1 周）

| # | 事项 | 说明 |
|---|---|---|
| 3.1 | README 重写 | 英文在前（self-hosted 圈层主要语言），首屏：GIF 演示 + 3 张截图 + 一键 `docker compose up` 命令；强调 BYOK、隐私、多市场 |
| 3.2 | 一键部署 | 完善 `docker-compose.prod.yml`；提供 `curl … | bash` 或 `npx create-` 风格引导；`.env.example` 每个变量带注释 |
| 3.3 | 首次运行向导 | 裸启动（无任何行情源）也能进首页，引导用户去设置页配 Key，而不是白屏/报错 |
| 3.4 | CI | GitHub Actions：`lint` + `build` + `db:migrate`（对空库），保证 clone 即跑 |
| 3.5 | 文档瘦身 | 公开仓库保留 `getting-started` / `architecture` / `deployment` / `api`，其余内部文档移除 |
| 3.6 | Release v1.0.0 | 打 tag、写 changelog、附镜像 `ghcr.io/<user>/q-stock:1.0.0`（README 直接给 docker run 命令） |

---

## Phase 4 · 冷启动与持续运营（持续）

| # | 动作 | 说明 |
|---|---|---|
| 4.1 | 发布渠道 | V2EX（分享创造节点）、Reddit r/selfhosted + r/algotrading、Hacker News (Show HN)、即刻/X；中文圈优先 V2EX |
| 4.2 | GitHub Sponsors | 上线即挂，放「用一杯咖啡支持」；双授权商业联系方式放 README 底部 |
| 4.3 | Issue 模板 | bug / feature 模板 + Roadmap 用 GitHub Projects 维护，把 `docs/product-roadmap.md` 转成公开 issues |
| 4.4 | 迭代节奏 | 每 2~4 周一个 release；外部 PR 的响应速度决定开源项目口碑，宁可功能少也要合得快 |
| 4.5 | 演示站数据 | 首页展示 live demo 链接 + `docker run` 命令对照，橱窗↔仓库互相导流 |

---

## 里程碑与验收

| 里程碑 | 内容 | 验收标准 |
|---|---|---|
| M1（第 1 周） | Phase 0 + 1 完成 | 历史清理完毕、密钥已轮换、未登录仅 crypto 可见 |
| M2（第 2 周） | Phase 2 完成 | 演示站月流量 < 20GB；UCloud 套餐降档可行 |
| M3（第 3 周） | Phase 3 完成 | 空环境 clone → `docker compose up` → 10 分钟内可用；CI 绿 |
| M4（第 4 周） | Phase 4 启动 | 公开发布，v1.0.0 tag，Sponsors 上线 |

## 风险清单

- **密钥泄露**是最大风险：M1 验收前不得公开仓库。
- **券商 API 监测**：BYOK 模式下用户自查自己的行情，风险已转移，但演示站若保留平台 env 拉股票行情，等于自己撞枪口——务必执行 1.2。
- **开源后维护成本**：Issue 会消耗时间，用模板 + Roadmap 控制预期；不想维护的功能直接 Wontfix。

---

*生成于 2026-10-24，基于当时仓库状态（Next.js 15 / Prisma / docker-compose / q-stock.cn 部署链路）。*
