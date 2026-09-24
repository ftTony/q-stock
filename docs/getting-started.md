# Q-Stock 启动与环境文档

本文说明本地开发、环境变量、数据库迁移、Worker 与 Docker 部署方式。

## 1. 环境要求

| 依赖 | 建议版本 |
|---|---|
| Node.js | 20+（推荐 22 / 24） |
| npm | 10+ |
| Docker / Docker Compose | 可选；用于 Postgres 或全栈一键启动 |
| 操作系统 | Windows / macOS / Linux |

外部账号（按需）：

- [Longbridge OpenAPI](https://open.longbridge.com/) App Key / Secret / Access Token（推荐，美股行情）
- [Futu OpenAPI](https://open.futunn.com/zh-cn/api/overview/) Access Token 或 AppKey+私钥（云端 REST，无需 OpenD）
- [Finnhub](https://finnhub.io/) API Key（回退行情 + 新闻/财报/公告）
- [Adanos](https://adanos.org/) API Key（可选，情绪）
- [Resend](https://resend.com/) 或自有 SMTP（可选，提醒邮件）

## 2. 快速开始（本地开发）

### 2.1 克隆与安装

```bash
cd q-stock
npm install
```

`postinstall` 会自动执行 `prisma generate`。

### 2.2 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`，至少配置：

```env
APP_URL=http://localhost:3000
AUTH_SECRET=请替换为足够长的随机字符串
DATABASE_URL=postgresql://qstock:qstock@localhost:5432/qstock?schema=public
# 加密用户自带的长桥/富途 Key（设置页 BYOK）
CREDENTIALS_ENCRYPTION_KEY=请填入64位hex（node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"）
# 平台行情兜底（游客与无 BYOK 用户可用）
FINNHUB_API_KEY=
```

可选：

```env
ADANOS_API_KEY=你的_adanos_key
EMAIL_FROM=alerts@example.com
RESEND_API_KEY=re_xxx
ALERT_POLL_INTERVAL_MS=45000
MARKET_DATA_PROVIDERS=longbridge,futu,finnhub,binance
```

登录后在 **设置 → 行情数据源** 填写你自己的长桥 / 富途 OpenAPI 凭证；服务端 `.env` 的 `LONGBRIDGE_*` / `FUTU_*` **不再**用于 Web 行情接口。

### 2.3 启动数据库

仅启动 Postgres：

```bash
docker compose up -d db
```

默认连接：

- Host: `localhost:5432`
- User / Password / DB: `qstock` / `qstock` / `qstock`

### 2.4 执行迁移

```bash
npm run db:migrate
```

开发期改 schema 可用：

```bash
npm run db:migrate:dev
```

### 2.5 启动 Web

```bash
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)，会跳转到默认语言 `/zh-CN`。

### 2.6 启动价格提醒 Worker

另开终端：

```bash
npm run worker
```

Worker 按 `ALERT_POLL_INTERVAL_MS`（默认 45000ms）轮询 `active` 提醒并尝试发信。

## 3. 环境变量说明

| 变量 | 必填 | 说明 |
|---|---|---|
| `APP_URL` | 建议 | 应用对外 URL，用于鉴权回调等 |
| `AUTH_SECRET` | 是 | Auth.js 密钥 |
| `AUTH_TRUST_HOST` | 建议 | Docker / 代理场景设为 `true` |
| `DATABASE_URL` | 是 | Prisma PostgreSQL 连接串 |
| `CREDENTIALS_ENCRYPTION_KEY` | 是* | 32 字节 hex/base64；加密用户长桥/富途 Key。缺则无法保存 BYOK |
| `MARKET_DATA_PROVIDERS` | 否 | 行情源优先级 CSV，默认含 longbridge,futu,finnhub,binance |
| `FINNHUB_API_KEY` | 否* | 平台 Finnhub；游客与无 BYOK 时的股票行情兜底 |
| `ADANOS_API_KEY` | 否 | 缺失时情绪区降级 |
| `EMAIL_FROM` | 发信时 | 发件人地址 |
| `RESEND_API_KEY` | 否 | 优先邮件通道 |
| `SMTP_HOST` | 否 | Resend 未配置时的 SMTP 主机 |
| `SMTP_PORT` | 否 | 默认 `587` |
| `SMTP_USER` / `SMTP_PASS` | 否 | SMTP 认证 |
| `SMTP_SECURE` | 否 | `true` 启用 TLS |
| `ALERT_POLL_INTERVAL_MS` | 否 | Worker 轮询间隔，默认 45000 |

说明：

- **长桥 / 富途**：由登录用户在设置页自带 Key（BYOK），加密存库；不通过服务端 env 向访客转发行情。
- 未配置 `RESEND_API_KEY` 且无 `SMTP_HOST` 时，提醒触发只写日志，不真正发信。
- Compose 中 `web` / `worker` 的 `DATABASE_URL` 会覆盖为指向服务名 `db` 的内网地址。

## 4. npm 脚本

| 命令 | 作用 |
|---|---|
| `npm run dev` | 开发服务器（Turbopack） |
| `npm run build` | `prisma generate` + 生产构建 |
| `npm run start` | 启动生产构建产物 |
| `npm run lint` | ESLint |
| `npm run db:generate` | 生成 Prisma Client |
| `npm run db:migrate` | 执行迁移（deploy） |
| `npm run db:migrate:dev` | 开发迁移 |
| `npm run db:push` | 直接推送 schema（不生成迁移文件） |
| `npm run worker` | 启动价格提醒 Worker |

## 5. Docker 一键启动

适用于希望同时拉起 Web、Postgres、Worker 的场景。

```bash
cp .env.example .env
# 填写 AUTH_SECRET、FINNHUB_API_KEY 等
docker compose up --build
```

| 服务 | 说明 |
|---|---|
| `db` | PostgreSQL 16，端口 5432 |
| `web` | Next.js standalone，端口 3000；启动时 `prisma migrate deploy` |
| `worker` | `tsx src/workers/price-alerts.ts` |

访问：

- 前端：[http://localhost:3000](http://localhost:3000)
- 健康检查：[http://localhost:3000/api/health](http://localhost:3000/api/health)

停止：

```bash
docker compose down
```

保留数据卷仅停容器：

```bash
docker compose stop
```

清除数据（慎用）：

```bash
docker compose down -v
```

## 6. 推荐本地拓扑

```text
浏览器 / H5
    │
    ▼
Next.js (npm run dev) ──► Finnhub / Adanos
    │
    ├── PostgreSQL (docker compose up -d db)
    │
Worker (npm run worker) ──► Finnhub quote + Email
```

开发时建议：

1. Compose 只起 `db`
2. 本机跑 `npm run dev` + `npm run worker`
3. 便于热更新与调试

## 7. 常见问题

### 7.1 Node 版本过低

Next.js 15 需要 Node 18.18+ / 20+。若 `nvm` 可用：

```bash
nvm install 22
nvm use 22
```

### 7.2 Prisma / 数据库连不上

- 确认 `docker compose up -d db` 已就绪
- 检查 `.env` 中 `DATABASE_URL` 端口与账号
- Compose 全栈启动时，容器内应使用主机名 `db`，不是 `localhost`

### 7.3 行情接口报错 / 空数据

- 检查 `FINNHUB_API_KEY`
- 免费档可能触发 429，稍后重试或减少刷新频率

### 7.4 情绪区一直不可用

- 检查 `ADANOS_API_KEY` 与套餐额度
- 属预期降级行为，不影响主行情

### 7.5 提醒不发邮件

- 配置 `RESEND_API_KEY` + `EMAIL_FROM`，或完整 SMTP
- 确认 Worker 进程在跑
- 未配置邮件时查看 Worker 控制台日志

### 7.6 Windows PowerShell 注意

部分环境不支持 `&&`，可分步执行：

```powershell
cp .env.example .env
npm install
npm run db:migrate
npm run dev
```

## 8. 健康检查

```bash
curl http://localhost:3000/api/health
```

期望大致返回：

```json
{
  "ok": true,
  "finnhub": true,
  "adanos": true
}
```

`ok: false` 通常表示数据库不可用。

## 9. 相关文档

- [需求文档](./requirements.md)
- [开发指南](./development.md)
- [排障手册](./troubleshooting.md)
- [生产部署](./deployment.md)
- 根目录 [README.md](../README.md)
- 环境变量模板：[.env.example](../.env.example)
