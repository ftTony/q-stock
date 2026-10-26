-- P2: shareable replays + lab reports (compare / param grid / basket)
ALTER TABLE "StrategyReplay" ADD COLUMN IF NOT EXISTS "shareToken" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "StrategyReplay_shareToken_key" ON "StrategyReplay"("shareToken");

CREATE TABLE IF NOT EXISTS "StrategyLabReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "cost" INTEGER NOT NULL DEFAULT 1,
    "request" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "result" JSONB,
    "error" TEXT,
    "shareToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrategyLabReport_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "StrategyLabReport_shareToken_key" ON "StrategyLabReport"("shareToken");
CREATE INDEX IF NOT EXISTS "StrategyLabReport_userId_createdAt_idx" ON "StrategyLabReport"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "StrategyLabReport_status_idx" ON "StrategyLabReport"("status");

ALTER TABLE "StrategyLabReport" DROP CONSTRAINT IF EXISTS "StrategyLabReport_userId_fkey";
ALTER TABLE "StrategyLabReport" ADD CONSTRAINT "StrategyLabReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
