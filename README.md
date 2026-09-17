# Q-Stock

美股 / 数字货币行情 Web & H5 系统（一期全量）。

技术栈：Next.js 15、TypeScript、Tailwind CSS、lightweight-charts、Auth.js、Prisma、PostgreSQL、Docker。  
数据源：Finnhub（行情 / K 线 / 新闻 / 财报 / 公告）+ Adanos（市场情绪 / 舆情）。

## 文档

完整说明见 [`docs/`](./docs/)：

- [需求文档](./docs/requirements.md)
- [启动与环境](./docs/getting-started.md)
- [架构说明](./docs/architecture.md)
- [API 参考](./docs/api.md)

## 最快启动

```bash
cp .env.example .env
# 填写 AUTH_SECRET、FINNHUB_API_KEY、DATABASE_URL

docker compose up -d db
npm install
npm run db:migrate
npm run dev
```

另开终端启动提醒 Worker：

```bash
npm run worker
```

打开 http://localhost:3000 。

全栈 Docker：

```bash
docker compose up --build
```

## 功能摘要

- 多语言（zh-CN / zh-TW / en）、多主题与涨跌色
- 登录注册、自选、资产概览、价格邮件提醒
- 美股 / 加密行情、K 线指标、新闻财报公告评论
- Adanos 情绪（缓存与降级）

更多细节与约束见需求文档。
