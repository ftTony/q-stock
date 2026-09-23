# Q-Stock

**Languages:** [简体中文](./README.md) · [English](./README.en.md) · [繁體中文](./README.zh-TW.md)

A Web & H5 market terminal for **US stocks**, **HK stocks**, and **crypto**: multi-source quotes, candlestick charts with indicators, news & earnings, paper trading, price email alerts, and market sentiment.

## Features

| Area | What you get |
|---|---|
| Markets | Popular lists (US / HK / crypto), search, gainers/losers, quiet polling refresh |
| Multi-source quotes | **Longbridge → Futu OpenAPI → Finnhub**, configurable priority with automatic failover |
| Symbol detail | Daily / quarterly / yearly candles; MA / EMA / BOLL / RSI / MACD |
| News & filings | News, earnings (surprises / calendar / metrics), press releases |
| Paper trading | Long-only; market / limit / stop; side panel on symbol page; Portfolio cash & positions |
| Watchlist & portfolio | CRUD watchlist, sparklines, overview KPIs |
| Price alerts | Email on ≥ / ≤ trigger (Resend / SMTP); background worker |
| Sentiment | Adanos (cached; degrades gracefully without a key) |
| AI analysis | Vercel AI SDK + DeepSeek; news + earnings + quote → bullish / neutral / bearish (~30 min cache) |
| UX | zh-CN / zh-TW / en, light/dark theme, CN or US up/down colors |

Stack: Next.js 15 · TypeScript · Tailwind · lightweight-charts · Auth.js · Prisma · PostgreSQL · Docker.

## Requirements

- Node.js **20+** (22 recommended)
- npm 10+
- Docker (optional, for Postgres or full stack)

Configure **at least one** quote provider (Longbridge / Futu / Finnhub). News & earnings need Finnhub. Sentiment needs Adanos (optional). AI analysis needs `DEEPSEEK_API_KEY` (optional).

## Quick start

```bash
cp .env.example .env
# Set AUTH_SECRET, DATABASE_URL, and at least one market-data key

docker compose up -d db
npm install
npm run db:migrate
npm run dev
```

In another terminal, start the worker (alerts + paper limit/stop fills):

```bash
npm run worker
```

Open [http://localhost:3000](http://localhost:3000) (defaults to `/zh-CN`; switch language in the UI).

Full stack:

```bash
docker compose up --build
```

## Environment configuration

Copy [.env.example](./.env.example) to `.env`.

### App & database

| Variable | Required | Notes |
|---|---|---|
| `APP_URL` | Recommended | e.g. `http://localhost:3000` |
| `AUTH_SECRET` | Yes | Long random secret for Auth.js |
| `AUTH_TRUST_HOST` | Recommended | `true` behind Docker / reverse proxy |
| `DATABASE_URL` | Yes | PostgreSQL connection string |

Default Compose DB:

```text
postgresql://qstock:qstock@localhost:5432/qstock?schema=public
```

### Market data

| Variable | Notes |
|---|---|
| `MARKET_DATA_PROVIDERS` | Priority CSV; default `longbridge,futu,finnhub`; omit to auto-detect from credentials |
| `LONGBRIDGE_APP_KEY` / `SECRET` / `ACCESS_TOKEN` | [Longbridge OpenAPI](https://open.longbridge.com/) — all three required to enable |
| `FUTU_ACCESS_TOKEN` | [Futu cloud OpenAPI](https://open.futunn.com/api/overview/) Bearer token (no OpenD) |
| `FUTU_APP_KEY` + `FUTU_PRIVATE_KEY` | Legacy AppKey signing (optional) |
| `FINNHUB_API_KEY` | Fallback quotes + news / earnings / press |

### Other

| Variable | Notes |
|---|---|
| `ADANOS_API_KEY` | Sentiment; UI degrades if missing |
| `DEEPSEEK_API_KEY` | AI trend analysis (Vercel AI SDK + DeepSeek); Tab degrades if missing |
| `DEEPSEEK_MODEL` | Optional, default `deepseek-v4-flash` |
| `DEEPSEEK_BASE_URL` | Optional, default DeepSeek official API |
| `EMAIL_FROM` / `RESEND_API_KEY` | Alert email (Resend preferred) |
| `SMTP_*` | SMTP fallback |
| `ALERT_POLL_INTERVAL_MS` | Worker interval, default `45000` |

## Scripts

```bash
npm run dev              # Dev server (Turbopack)
npm run build && npm start
npm run worker           # Alerts + paper pending orders
npm run db:migrate       # Apply migrations
npm run db:migrate:dev   # Dev schema changes
npm run lint
```

## How to use the product

1. **Sign up / sign in** — email + password; required for watchlist, comments, alerts, paper trading.
2. **Markets** — switch US / HK / crypto, search into a symbol (HK e.g. `00700`).
3. **Symbol page** — charts & indicators; paper trade on the right; news / earnings / press / comments / sentiment / AI analysis tabs.
4. **Watchlist / Portfolio** — manage symbols; view paper cash, P&L, open orders.
5. **Alerts** — set price ≥ / ≤; needs email config + running worker.
6. **Settings** — language, theme, up/down color scheme (persisted).

Paper trading starts with **$100,000** (long-only); reset from Portfolio. Live broker order routing is stubbed for a later phase.

## Documentation

| Doc | Content |
|---|---|
| [docs/](./docs/) | Doc hub |
| [Requirements](./docs/requirements.md) | Scope & acceptance (Chinese) |
| [Getting started](./docs/getting-started.md) | Deeper setup |
| [Market & trading design](./docs/market-trading-tech.md) | Providers & paper matching |
| [Architecture](./docs/architecture.md) · [API](./docs/api.md) · [Database](./docs/database.md) | Implementation detail |
| [Deployment](./docs/deployment.md) · [Troubleshooting](./docs/troubleshooting.md) | Ops |

## License

Private / per repository terms.
