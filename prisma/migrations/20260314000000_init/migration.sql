-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('stock', 'crypto');
CREATE TYPE "ThemeMode" AS ENUM ('light', 'dark', 'system');
CREATE TYPE "ChangeColorScheme" AS ENUM ('cn', 'us');
CREATE TYPE "LocaleCode" AS ENUM ('zh_CN', 'zh_TW', 'en');
CREATE TYPE "AlertCondition" AS ENUM ('gte', 'lte');
CREATE TYPE "AlertStatus" AS ENUM ('active', 'triggered', 'disabled');

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "locale" "LocaleCode" NOT NULL DEFAULT 'zh_CN',
    "theme" "ThemeMode" NOT NULL DEFAULT 'system',
    "changeColorScheme" "ChangeColorScheme" NOT NULL DEFAULT 'cn',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WatchlistItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "assetType" "AssetType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WatchlistItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PriceAlert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "assetType" "AssetType" NOT NULL,
    "condition" "AlertCondition" NOT NULL,
    "triggerPrice" DECIMAL(18,8) NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'active',
    "triggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PriceAlert_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "assetType" "AssetType" NOT NULL,
    "content" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AlertDeliveryLog" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "price" DECIMAL(18,8) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AlertDeliveryLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ApiCache" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiCache_pkey" PRIMARY KEY ("key")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "WatchlistItem_userId_idx" ON "WatchlistItem"("userId");
CREATE UNIQUE INDEX "WatchlistItem_userId_symbol_assetType_key" ON "WatchlistItem"("userId", "symbol", "assetType");
CREATE INDEX "PriceAlert_status_idx" ON "PriceAlert"("status");
CREATE INDEX "PriceAlert_userId_idx" ON "PriceAlert"("userId");
CREATE INDEX "PriceAlert_symbol_assetType_idx" ON "PriceAlert"("symbol", "assetType");
CREATE INDEX "Comment_symbol_assetType_createdAt_idx" ON "Comment"("symbol", "assetType", "createdAt");
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");
CREATE INDEX "AlertDeliveryLog_alertId_idx" ON "AlertDeliveryLog"("alertId");
CREATE INDEX "ApiCache_expiresAt_idx" ON "ApiCache"("expiresAt");

ALTER TABLE "WatchlistItem" ADD CONSTRAINT "WatchlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PriceAlert" ADD CONSTRAINT "PriceAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AlertDeliveryLog" ADD CONSTRAINT "AlertDeliveryLog_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "PriceAlert"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AlertDeliveryLog" ADD CONSTRAINT "AlertDeliveryLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
