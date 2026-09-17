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
- [ ] `APP_URL` 设为真实公网 HTTPS 地址
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

- [ ] `web` 与 `worker` 同时运行（缺 worker 则提醒不触发）
- [ ] `ALERT_POLL_INTERVAL_MS` 按 Finnhub 限额调整（默认 45000）
- [ ] 日志可采集（stdout）

### 2.4 网络与 TLS

- [ ] 前置 Nginx / Caddy / 云 LB 终结 HTTPS
- [ ] 反代转发到 `web:3000`
- [ ] 健康检查：`GET /api/health`

## 3. Compose 生产示例步骤

```bash
git clone <repo> q-stock && cd q-stock
cp .env.example .env
# 编辑 .env：AUTH_SECRET、FINNHUB_API_KEY、邮件、APP_URL 等

docker compose up --build -d
docker compose ps
curl -s https://your-domain.example/api/health
```

更新发布：

```bash
git pull
docker compose up --build -d
```

查看日志：

```bash
docker compose logs -f web
docker compose logs -f worker
```

## 4. 反向代理示例（Nginx）

```nginx
server {
  listen 443 ssl http2;
  server_name your-domain.example;

  # ssl_certificate     ...;
  # ssl_certificate_key ...;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

确保 `APP_URL=https://your-domain.example`。

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

Worker 日志关键字：`[alerts] triggered`、`[email]`、`quote failed`。

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
