# Q-Stock 开发指南

面向在本仓库上继续改功能的开发者。环境搭建见 [启动与环境](./getting-started.md)，整体结构见 [架构说明](./architecture.md)。

## 1. 日常开发流程

```bash
docker compose up -d db
cp .env.example .env   # 若尚未配置
npm install
npm run db:migrate
npm run dev            # http://localhost:3000
```

另开终端（改提醒相关时）：

```bash
npm run worker
```

建议 Node.js 20+。Windows PowerShell 请分步执行命令，避免 `&&` 兼容问题。

## 2. 常用命令

| 命令 | 用途 |
|---|---|
| `npm run dev` | 开发热更新 |
| `npm run build` | 生产构建校验 |
| `npm run lint` | ESLint |
| `npm run db:migrate:dev` | 改 Prisma schema 后生成迁移 |
| `npm run worker` | 本地提醒 Worker |

提交前建议至少跑通：`npm run lint` + `npm run build`。

## 3. 扩展功能速查

### 3.1 新增页面

1. 在 `src/app/[locale]/your-page/page.tsx` 添加页面
2. 需要导航时改 `src/components/layout/app-shell.tsx`（侧栏 / 顶栏 / H5 底栏）
3. 文案写入 `messages/zh-CN.json`、`zh-TW.json`、`en.json`（三份保持同 key）

### 3.2 新增 BFF API

1. 添加 `src/app/api/<name>/route.ts`
2. 入参用 Zod 校验
3. 需登录时：`const session = await auth()`，无 id 返回 401
4. 更新 [API 参考](./api.md)

### 3.3 接入更多 Finnhub 能力

1. 在 `src/lib/finnhub/client.ts` 封装请求（复用 `finnhubFetch` + `cachedFetch`）
2. 通过 Route Handler 暴露，勿把 Key 传到客户端
3. 注意免费档 rate limit，为新接口选合理 TTL

### 3.4 改数据模型

1. 编辑 `prisma/schema.prisma`
2. `npm run db:migrate:dev`（本地）
3. 同步更新 [数据库说明](./database.md)

### 3.5 改技术指标 / K 线

- 指标：`src/lib/indicators/index.ts`
- 季年聚合：`src/lib/candles/aggregate.ts`
- 图表渲染：`src/components/charts/candle-chart.tsx`（KLineChart，支持画线 Overlay）

### 3.6 改主题视觉

- CSS 变量：`src/app/globals.css`（`--brand`、`--up`、`--down` 等）
- 涨跌色：`html[data-change="cn"|"us"]`
- 组件样式类：`qt-panel` / `qt-card` / `qt-btn-*`

## 4. 编码约定

- TypeScript 严格模式；API 边界用 Zod
- 客户端组件标明 `"use client"`
- 外部 API 只走服务端 `src/lib/*`
- 文案不硬编码中文到组件（走 `useTranslations` / `getTranslations`）
- 加密符号内部存短码（`BTC`），Finnhub 映射在 `toFinnhubSymbol`

## 5. 调试技巧

| 问题 | 做法 |
|---|---|
| 行情空 / 502 | 看服务端日志与 `FINNHUB_API_KEY`；打 `/api/quotes?symbol=AAPL&assetType=stock` |
| Session 丢失 | 查 `AUTH_SECRET`、`APP_URL`、是否跨域丢 Cookie |
| 迁移失败 | 确认 DB 已起、`DATABASE_URL` 正确 |
| 图表不显示 | 浏览器控制台；确认 candles 返回非空 `bars` |
| Worker 无输出 | 确认有 `active` 提醒；看 `[alerts]` 日志 |

健康检查：`GET /api/health`。

## 6. 设计稿资源

`docs/` 下可能包含 UI 导出（如 `screen*.png`、`code*.html`、`DESIGN.md`）。实现以当前代码与 [需求文档](./requirements.md) 为准；设计稿仅作视觉参考。

## 7. 相关文档

- [排障手册](./troubleshooting.md)
- [API 参考](./api.md)
- [生产部署](./deployment.md)
