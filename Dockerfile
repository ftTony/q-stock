# syntax=docker/dockerfile:1.7
# BuildKit recommended: DOCKER_BUILDKIT=1 docker build ...

# ---- base ----
FROM node:22-trixie-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# ---- deps ----
FROM base AS deps
WORKDIR /app

# npm 网络加固。两个偶发失败都出在这一层：
#   1) ECONNRESET / network aborted —— longbridge 的 optionalDependencies 里
#      longbridge-linux-x64-gnu 是几十 MB 的原生 binding，断流即整体失败；
#   2) TAR_ENTRY_ERROR ENOENT —— 中断后 /root/.npm 缓存里留下半截 tarball，
#      后续重试从坏缓存解包，报 next/dist/... 不存在。
# 所以既要提高重试，也要在失败时清缓存，否则重试必然复现同一个错。
ENV NPM_CONFIG_FETCH_RETRIES=5 \
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000 \
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000 \
    NPM_CONFIG_FETCH_TIMEOUT=600000 \
    NPM_CONFIG_MAXSOCKETS=6 \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_UPDATE_NOTIFIER=false

# 国内构建可 --build-arg NPM_REGISTRY=https://registry.npmmirror.com
ARG NPM_REGISTRY=https://registry.npmjs.org
ARG NPM_REGISTRY_FALLBACK=https://registry.npmmirror.com

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN --mount=type=cache,target=/root/.npm \
    set -eu; \
    attempt() { npm ci --include=optional --no-audit --no-fund --registry="$1"; }; \
    reset() { npm cache clean --force >/dev/null 2>&1 || true; rm -rf /app/node_modules; }; \
    attempt "$NPM_REGISTRY" \
      || { echo "npm ci 失败，清缓存后改用镜像源重试"; reset; attempt "$NPM_REGISTRY_FALLBACK"; } \
      || { echo "镜像源仍失败，回退官方源重试"; reset; attempt "$NPM_REGISTRY"; }

# 单独一层：install 命中缓存时这条仍会执行，能在几秒内确认原生 binding 可用。
RUN node -e "import('longbridge').then(() => { console.log('Longbridge SDK loaded'); process.exit(0); }, (error) => { console.error(error); process.exit(1); })"

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
