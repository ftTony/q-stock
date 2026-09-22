# Q-Stock 排障手册

按症状定位。本地启动步骤见 [启动与环境](./getting-started.md)。

## 1. 启动与环境

### 页面打不开 / `next` 报 Node 版本错误

- Next.js 15 需要 Node **18.18+ / 20+**（推荐 22 或 24）
- 使用 nvm：`nvm install 22 && nvm use 22`
- 确认 `node -v` 后再 `npm run dev`

### `npm install` 后 Prisma 报错

```bash
npx prisma generate
```

若仍失败，删除 `node_modules` 重装，并确认 Node 版本足够新（过旧 Node 可能触发 Prisma WASM 错误）。

### 数据库连接失败

1. `docker compose up -d db`
2. 等待 healthy：`docker compose ps`
3. 核对 `.env` 中 `DATABASE_URL`
   - 本机开发：主机用 `localhost`
   - Compose 内 web/worker：主机用 `db`
4. 执行 `npm run db:migrate`

### Windows PowerShell 命令失败

不要依赖 `&&`，改为分行执行。

## 2. 鉴权

### 无法登录 / 注册后立即失败

- 注册接口是否 `201`：`POST /api/auth/register`
- 密码至少 6 位
- 邮箱是否已存在（`409`）
- `AUTH_SECRET` 是否已设置且稳定（频繁变更会使旧 Session 失效）

### 登录成功但刷新掉登录态

- 检查 `APP_URL` 是否与访问地址一致（协议 / 域名）
- 代理场景设置 `AUTH_TRUST_HOST=true`
- 浏览器是否拦截 Cookie

### 自选 / 提醒 / 设置返回 401

属预期：需先登录。前端应引导至 `/login`。

## 3. 行情与图表

### 热门列表为空或报错

1. `.env` 是否有 `FINNHUB_API_KEY`
2. 直接请求：`/api/quotes?popular=1&assetType=stock`
3. 服务端日志是否出现 `429`（限流）→ 等待或降低刷新频率
4. `/api/health` 中 `finnhub` 是否为 `true`（仅表示 Key 已配置，不保证额度）

### 单个标的无报价

- 股票代码是否正确（如 `AAPL`）
- 加密是否用短码（`BTC` 而非 `BINANCE:BTCUSDT`）；映射由服务端完成
- `assetType` 是否匹配（`stock` / `crypto`）

### K 线空白

1. `/api/candles?symbol=AAPL&assetType=stock&resolution=D`
2. 确认 `bars` 非空且 `s` 在上游为 ok
3. 季 K / 年 K 依赖更长历史；若上游无月 K，会回退日 K 聚合，数据量不足时可能很少
4. 如果返回 `CANDLE_ACCESS_DENIED`，说明当前 Finnhub API Key 能访问报价，但没有 K 线权限；需要升级 Finnhub 套餐或配置其他 K 线数据源，单纯更换请求参数无法解决

### 指标不显示

- 详情页确认已勾选 MA / EMA / BOLL / RSI / MACD
- candles 响应中是否包含 `indicators`（`indicators=0` 会关闭）

## 4. 资讯 / 情绪

### 新闻为空

- Finnhub 该标的可能暂无新闻
- 加密走市场新闻过滤，可能匹配较少

### 财报 / 公告降级提示

- 部分接口需 Finnhub 付费档
- UI 降级为空列表 + `degraded`，属预期

### 情绪区一直 unavailable

1. 配置 `ADANOS_API_KEY`
2. 检查套餐额度（免费档极低）
3. 查看 `/api/sentiment` 返回的 `message`
4. 有缓存时需等待 TTL（约 30 分钟）或重启进程清内存缓存

## 5. 自选与提醒

### 自选添加失败

- 是否已登录
- `POST /api/watchlist` 响应是否非 401/400
- symbol 是否被 `normalizeSymbol` 规范化

### 提醒不触发

| 检查项          | 说明                                            |
| --------------- | ----------------------------------------------- |
| Worker 是否运行 | `npm run worker` 或 Compose `worker`            |
| 提醒状态        | 必须为 `active`                                 |
| 条件与现价      | `gte` / `lte` 是否已满足                        |
| Quote 是否成功  | Worker 日志 `quote failed`                      |
| 触发后状态      | 变为 `triggered` 后不会再次发送，需「重新启用」 |

### 触发了但没有邮件

1. 配置 `RESEND_API_KEY` + `EMAIL_FROM`，或 SMTP 全套变量
2. Resend 需发件域名 / 地址验证
3. 未配置邮件时，Worker 只会 `console` 日志，视为开发回退
4. 查表 `AlertDeliveryLog` 是否已有记录（有记录说明业务侧已走完投递流程）

## 6. Docker

### `web` 启动退出

```bash
docker compose logs web
```

常见原因：

- 缺少 `.env` 或 `AUTH_SECRET`
- 迁移失败（DB 未就绪）→ 看 `depends_on` / healthcheck
- 构建失败 → 本地先 `npm run build`

### 容器内连不上库

Compose 已注入 `DATABASE_URL=...@db:5432...`。不要在容器里用 `localhost` 指数据库。

### 端口占用

修改 `docker-compose.yml` 中 `"3000:3000"` / `"5432:5432"` 左侧主机端口。

## 7. 构建

### `npm run build` 失败

1. 阅读 TypeScript / ESLint 报错文件行号
2. 确认 Prisma Client 已生成
3. Node 版本符合要求

### 仅类型错误

可先 `npx tsc --noEmit` 快速定位。

## 8. 快速自检清单

```bash
curl -s http://localhost:3000/api/health
curl -s "http://localhost:3000/api/quotes?symbol=AAPL&assetType=stock"
curl -s "http://localhost:3000/api/candles?symbol=AAPL&assetType=stock&resolution=D" | head
```

浏览器：注册 → 登录 → 加自选 → 开详情 K 线 → 建提醒 → 看 Worker 日志。

## 9. 相关文档

- [启动与环境](./getting-started.md)
- [开发指南](./development.md)
- [生产部署](./deployment.md)
- [API 参考](./api.md)
