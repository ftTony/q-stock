# syntax=docker/dockerfile:1.7
# BuildKit recommended: DOCKER_BUILDKIT=1 docker build ...

# ---- base ----
FROM node:22-trixie-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# ---- deps ----
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN --mount=type=cache,target=/root/.npm \
    npm ci --include=optional \
    && node -e "import('longbridge').then(() => { console.log('Longbridge SDK loaded'); process.exit(0); }, (error) => { console.error(error); process.exit(1); })"

# ---- builder ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# CI already typechecks; cut SSG fan-out (10 locales → 3). See docs/build-performance.md
ENV SKIP_TYPECHECK=1
ENV SSG_LOCALES=en,zh-CN,zh-TW
ARG NEXT_PUBLIC_QUOTE_WS_URL
ENV NEXT_PUBLIC_QUOTE_WS_URL=${NEXT_PUBLIC_QUOTE_WS_URL}
# `npm run build` already runs prisma generate — do not duplicate.
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

# ---- web runner ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# ✅ 只启动Next服务，移除 prisma migrate deploy
CMD ["node", "standalone/server.js"]

# ---- alert worker ----
FROM base AS worker
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY package.json ./
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src
CMD ["npx", "tsx", "src/workers/price-alerts.ts"]
