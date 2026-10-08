# Q-Stock

**Languages:** [简体中文](./README.md) · [English](./README.en.md) · [繁體中文](./README.zh-TW.md)

Web & H5 terminal for **US / HK / A-share / crypto** markets: multi-source quotes, charts & indicators, news, paper trading, price email alerts, sentiment, and AI analysis.

## Features

| Area | What you get |
|---|---|
| Markets | US / HK / **CN** / crypto lists & boards; search; ~45s quiet refresh |
| Multi-source quotes | Equity: **Longbridge ↔ Futu → Finnhub** (preferred broker in Settings); Crypto: **Binance ↔ OKX → Finnhub**; creds = **platform env first, else user BYOK** |
| Markets home | KPIs, rank boards (heart watchlist), industry heatmap (non-crypto), HK IPO, sentiment; topbar index carousel |
| Symbol detail | D/Q/Y candles (KLineChart + drawings), MA/EMA/BOLL/RSI/MACD; compact header + heart; paper trade panel |
| Tabs | News (LB→Futu→Finnhub), earnings/press, company/officers, comments, sentiment, AI |
| Analysis | `/analysis` popular cards by market |
| Watchlist & portfolio | CRUD (incl. cn), sparklines; paper cash/positions/orders/reset |
| Alerts | ≥ / ≤ email (Resend/SMTP); worker poll |
| Paper trading | Long-only; market/limit/stop; **$100,000** start |
| Settings | Language/theme/colors; LB/Futu/Binance/OKX BYOK; multi-vendor AI keys; invites |
| UX | 10 locales, light/dark, CN/US color schemes; collapsible sidebar; H5 bottom nav |

Stack: Next.js 15 · TypeScript · Tailwind · KLineChart · Auth.js · Prisma · PostgreSQL · Docker.

> Fuyao client code exists but is **hard-disabled** in the market router and hidden from Settings. CN quotes use Longbridge / Futu / Finnhub.

## Requirements

- Node.js **20+** (22 recommended)
- npm 10+
- Docker (optional)

Configure **at least one** quote path: platform env and/or Settings BYOK. News needs Finnhub or broker content APIs. Sentiment needs Adanos (optional). AI needs user BYOK or `DEEPSEEK_API_KEY` (optional).

## Quick start

```bash
cp .env.example .env
# Set AUTH_SECRET, DATABASE_URL, CREDENTIALS_ENCRYPTION_KEY, and at least one market key

docker compose up -d db
npm install
npm run db:migrate
npm run dev
```

Worker (alerts + paper limit/stop fills):

```bash
npm run worker
```

Open [http://localhost:3000](http://localhost:3000) (default English, no `/en` prefix; other locales use `/zh-CN/...`, etc.).

```bash
docker compose up --build
```

## Environment configuration

See [.env.example](./.env.example).

### App & database

| Variable | Required | Notes |
|---|---|---|
| `APP_URL` | Recommended | e.g. `http://localhost:3000` |
| `AUTH_SECRET` | Yes | Auth.js secret |
| `AUTH_TRUST_HOST` | Recommended | `true` behind proxy |
| `DATABASE_URL` | Yes | PostgreSQL |
| `AUTH_GOOGLE_*` / `AUTH_GITHUB_*` | No | Optional OAuth |

### Market data

Resolution (`resolve-market-creds.ts`): **env first**, then Settings BYOK (encrypted).

| Variable | Notes |
|---|---|
| `MARKET_DATA_PROVIDERS` | Priority CSV |
| `LONGBRIDGE_*` (3 keys) | Platform Longbridge |
| `FUTU_ACCESS_TOKEN` or AppKey+PK | Platform Futu |
| `BINANCE_API_KEY` / `SECRET` | Optional |
| `OKX_API_KEY` / `SECRET` / `PASSPHRASE` | Optional |
| `FINNHUB_API_KEY` | Fallback quotes + news |
| `CREDENTIALS_ENCRYPTION_KEY` | Encrypts user BYOK |

### Other

| Variable | Notes |
|---|---|
| `ADANOS_API_KEY` | Sentiment |
| `DEEPSEEK_API_KEY` | Platform AI fallback |
| `EMAIL_FROM` / `RESEND_API_KEY` / `SMTP_*` | Mail |
| `ALERT_POLL_INTERVAL_MS` | Worker interval (default `45000`) |

## Implementation sketch

| Concern | Where |
|---|---|
| Market facade | `@/lib/market` + `router` failover by asset & vendor prefs |
| Creds | `withUserMarket` ALS; `UserMarketCredential` encrypted |
| Shell | `AppShell` + collapsible `AppSidebar`; `TopbarIndexTicker` |
| Charts | `CandleChart` + drawing tools |
| Paper | `@/lib/trading/*` + worker |
| AI | `@/lib/ai` + `/api/ai/analyze` |

Details: [docs/market-trading-tech.md](./docs/market-trading-tech.md), [docs/architecture.md](./docs/architecture.md).

## Scripts

```bash
npm run dev
npm run build && npm start
npm run worker
npm run db:migrate
npm run lint
```

## How to use

1. **Sign up / in** — email/password; optional Google/GitHub.
2. **Markets** — US/HK/CN/crypto; search; heart = watchlist.
3. **Symbol** — chart, paper trade, tabs, alerts.
4. **Watchlist / Portfolio** — manage symbols; paper P&L; reset account.
5. **Alerts** — need mail + worker.
6. **Settings** — prefs, BYOK, AI keys, invites; collapse sidebar to icons.

## Docs

| Doc | Topic |
|---|---|
| [docs/](./docs/) | Hub |
| [Requirements](./docs/requirements.md) | Scope |
| [Getting started](./docs/getting-started.md) | Install |
| [Market & paper trading](./docs/market-trading-tech.md) | Providers / matching |
| [Architecture](./docs/architecture.md) · [API](./docs/api.md) · [DB](./docs/database.md) | Tech |
| [Deploy](./docs/deployment.md) · [Troubleshooting](./docs/troubleshooting.md) | Ops |

## License

Private / as agreed for this repository.
