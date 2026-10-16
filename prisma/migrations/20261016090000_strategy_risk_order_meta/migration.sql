-- AlterTable
ALTER TABLE "PaperAccount" ADD COLUMN "dayStartEquity" DECIMAL(18,4),
ADD COLUMN "dayStartDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PaperRiskSettings" (
    "userId" TEXT NOT NULL,
    "maxPositionPctPerSymbol" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "maxGrossExposurePct" DOUBLE PRECISION NOT NULL DEFAULT 80,
    "maxDailyLossPct" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "maxOrderNotionalPct" DOUBLE PRECISION,
    "softOnly" BOOLEAN NOT NULL DEFAULT true,
    "requireEmotionCheck" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaperRiskSettings_pkey" PRIMARY KEY ("userId")
);

-- AlterTable
ALTER TABLE "PaperOrder" ADD COLUMN "emotionTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "invalidationNote" TEXT,
ADD COLUMN "strategyId" TEXT,
ADD COLUMN "riskSnapshot" JSONB;

-- CreateTable
CREATE TABLE "Strategy" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "slug" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rules" JSONB NOT NULL,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Strategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyReplay" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "assetType" "AssetType" NOT NULL,
    "rangeFrom" TIMESTAMP(3) NOT NULL,
    "rangeTo" TIMESTAMP(3) NOT NULL,
    "assumptions" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "result" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrategyReplay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Strategy_userId_idx" ON "Strategy"("userId");

-- CreateIndex
CREATE INDEX "Strategy_isTemplate_idx" ON "Strategy"("isTemplate");

-- CreateIndex
CREATE UNIQUE INDEX "Strategy_slug_key" ON "Strategy"("slug");

-- CreateIndex
CREATE INDEX "StrategyReplay_userId_createdAt_idx" ON "StrategyReplay"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "StrategyReplay_status_idx" ON "StrategyReplay"("status");

-- CreateIndex
CREATE INDEX "PaperOrder_strategyId_idx" ON "PaperOrder"("strategyId");

-- AddForeignKey
ALTER TABLE "PaperRiskSettings" ADD CONSTRAINT "PaperRiskSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Strategy" ADD CONSTRAINT "Strategy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyReplay" ADD CONSTRAINT "StrategyReplay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyReplay" ADD CONSTRAINT "StrategyReplay_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaperOrder" ADD CONSTRAINT "PaperOrder_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
