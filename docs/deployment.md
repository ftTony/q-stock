# Q-Stock 生产部署指南

面向将 Q-Stock 部署到服务器或容器平台的检查清单与建议。开发环境请优先阅读 [启动与环境](./getting-started.md)。

## 1. 部署形态

推荐：**Docker Compose 三服务**（与仓库一致）。

| 服务 | 作用 | 对外 |
|---|---|---|
| `web` | Next.js standalone + 迁移 | `3000` |
| `worker` | 价格提醒轮询 | 无 |
| `db` | PostgreSQL 16 | 建议不对公网暴露 |

也支持：外部托管 Postgres + 本机构建的 Node 进程分别跑 web / worker。

## 2. 上线前检查清单

### 2.1 密钥与配置

- [ ] 使用强随机 `AUTH_SECRET`（勿用示例值）
- [ ] `APP_URL` 与 `AUTH_URL` 都设为真实公网 HTTPS 地址（同一 origin）
- [ ] `AUTH_TRUST_HOST=true`（反向代理场景）
- [ ] `FINNHUB_API_KEY` 有效且额度足够
- [ ] （可选）`ADANOS_API_KEY`；无则情绪降级
- [ ] （可选）`RESEND_API_KEY` + 已验证的 `EMAIL_FROM`，或 SMTP
- [ ] `.env` 不提交仓库；宿主机权限收紧

### 2.2 数据库

- [ ] 生产 `DATABASE_URL` 使用强密码
- [ ] Compose 内网主机名用 `db`，勿把 5432 随意映射公网
- [ ] 确认迁移可执行：`prisma migrate deploy`
- [ ] 配置定期 `pg_dump` 备份

### 2.3 进程

- [ ] `web` 与 `worker` 同时运行（缺 worker 则提醒不触发；worker 同时开行情 WS `:3001/ws/quotes`）
- [ ] 前端 `NEXT_PUBLIC_QUOTE_WS_URL`（本地 `ws://localhost:3001/ws/quotes`；生产 `wss://域名/ws/quotes`）。这是浏览器可访问的地址，会在 Docker 构建时写入前端；改动后需重新构建镜像。
- [ ] Cloudflare Tunnel 将 `/ws/quotes` 路由到 worker:3001，将其它请求路由到 web:3000；Tunnel 支持 WebSocket，无需 Nginx
- [ ] `ALERT_POLL_INTERVAL_MS` 按 Finnhub 限额调整（默认 45000）
- [ ] SEO：公网 `APP_URL` 正确；`/sitemap.xml`、`/robots.txt` 可访问；向 Google Search Console 提交 sitemap（仅含公开页；账号页 noindex）
- [ ] 统计：配置 `NEXT_PUBLIC_GA_MEASUREMENT_ID`（GA4）；可选 `GOOGLE_SITE_VERIFICATION` 完成站长验证
- [ ] Worker 在美东 00:00–01:00 写按市场拆分的 sitemap（按 ET 日去重；`sitemap.xml` 索引 + `sitemap-stock|hk|cn|crypto[-N].xml`；Compose 共享卷 `sitemaps`；也可 `npm run seo:sitemap`）
- [ ] 日志可采集（stdout）

### 2.4 网络与 TLS

- [ ] 使用 Cloudflare Tunnel 时，将公网 HTTPS/WSS 流量转发到本机服务；无需开放源站入站端口
- [ ] 不要将 `:3001` 直接设为浏览器 WebSocket 地址；生产统一使用 `wss://域名/ws/quotes`
- [ ] 健康检查：`GET /api/health`

## 3. Compose 生产示例步骤

```bash
git clone <repo> q-stock && cd q-stock
cp .env.example .env
# 在 .env 设置 AUTH_SECRET、FINNHUB_API_KEY、POSTGRES_USER、
# POSTGRES_PASSWORD（建议 openssl rand -hex 32）、POSTGRES_DB、
# APP_URL、AUTH_URL 和 NEXT_PUBLIC_QUOTE_WS_URL。

docker compose -f docker-compose.prod.yml up --build -d
docker compose -f docker-compose.prod.yml ps
curl -s https://your-domain.example/api/health
```

更新发布：

```bash
git pull
docker compose -f docker-compose.prod.yml up --build -d
```

查看日志：

```bash
docker compose -f docker-compose.prod.yml logs -f web
docker compose -f docker-compose.prod.yml logs -f worker
```

## 4. Cloudflare Tunnel

Cloudflare 橙云支持 WebSocket，但不能直接代理 `:3001` 这个端口。使用 Cloudflare Tunnel 可按路径将行情 WebSocket 与 Web 应用分别转发，不必安装 Nginx。以下示例假设 `cloudflared` 安装并运行在 Docker 主机上，Compose 已将 web 和 worker 端口映射到主机。

在 Cloudflare DNS 中为域名配置 Tunnel 路由，然后配置 `cloudflared`（例如 `/etc/cloudflared/config.yml`）：

```yaml
tunnel: <TUNNEL_UUID>
credentials-file: /etc/cloudflared/<TUNNEL_UUID>.json

ingress:
  - hostname: your-domain.example
    path: ^/ws/quotes$
    service: http://localhost:3001
  - hostname: your-domain.example
    service: http://localhost:3000
  - service: http_status:404
```

先匹配 `/ws/quotes`，其余请求再交给 web。将 `your-domain.example` 替换为真实域名；启动 Tunnel 后，Cloudflare 对外提供 HTTPS/WSS，Tunnel 在源站内部连接本机 HTTP 服务。确认 Cloudflare Dashboard 的 **Network → WebSockets** 已启用。

如果 `cloudflared` 也运行在 Docker 中，不要使用 `localhost`：在同一个 Compose 网络中将上面的源站地址分别改为 `http://worker:3001` 和 `http://web:3000`。

确保 `APP_URL` 和 `AUTH_URL` 都是 `https://your-domain.example`。修改 `NEXT_PUBLIC_QUOTE_WS_URL` 后需重新构建 web 镜像：`docker compose up --build -d`。

## 5. 资源与容量建议（起步）

| 组件 | 起步配置 |
|---|---|
| web | 1 vCPU / 1–2 GB RAM |
| worker | 0.25–0.5 vCPU / 256–512 MB |
| db | 1 vCPU / 1 GB + 磁盘视备份策略 |

瓶颈通常在 **Finnhub / Adanos 外部配额**，而非本机 CPU。热门页轮询、详情报价刷新会叠加请求，注意 429。

## 6. 运维观察点

| 信号 | 含义 |
|---|---|
| `/api/health` → `ok:false` | DB 连不上 |
| 行情大量 502 / 空列表 | Finnhub Key 或限流 |
| 情绪长期 unavailable | Adanos Key / 额度 |
| 提醒不触发 | worker 未起或 quote 失败 |
| 提醒触发无邮件 | 未配 Resend/SMTP（仅日志） |

Worker 日志关键字：`[alerts] triggered`、`[alerts] re-armed`、`[email]`、`quote failed`。

## 7. 安全建议

1. 生产库密码与示例 `qstock/qstock` 脱钩  
2. 限制 Postgres 端口仅内网  
3. 定期轮换 API Key  
4. 不要在前端暴露任何第三方 Key  
5. 如对公网开放注册，考虑后续加验证码 / 邮件验证（一期未做）

## 8. 回滚思路

1. `git checkout` 上一稳定版本  
2. `docker compose up --build -d`  
3. 若迁移不可逆，先用备份恢复 DB，再部署旧版本镜像  

一期迁移以 `init` 为主，结构变更前请先备份。

## 9. 相关文档

- [启动与环境](./getting-started.md)
- [数据库说明](./database.md)
- [架构说明](./architecture.md)
- [需求文档](./requirements.md)
