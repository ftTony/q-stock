# Q-Stock FastAPI (`services/api`)

Modular monolith for the main product path: auth JWT, market quotes/candles/search, watchlist, paper trading, strategy CRUD + replay enqueue.

## Local

```bash
# from repo root
docker compose up -d db redis
cd services/api
pip install -r requirements.txt
# DATABASE_URL / REDIS_URL / AUTH_SECRET (or JWT_SECRET) from ../.env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Or: `npm run dev:api` from repo root.

OpenAPI: http://127.0.0.1:8000/docs

Next.js rewrites `/api/v1/*` → `API_INTERNAL_URL` (default `http://127.0.0.1:8000`).
