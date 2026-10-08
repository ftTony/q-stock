-- CreateTable
CREATE TABLE "WatchlistDigestLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tradeDate" TEXT NOT NULL,
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchlistDigestLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WatchlistDigestLog_tradeDate_idx" ON "WatchlistDigestLog"("tradeDate");

-- CreateIndex
CREATE UNIQUE INDEX "WatchlistDigestLog_userId_tradeDate_key" ON "WatchlistDigestLog"("userId", "tradeDate");

-- AddForeignKey
ALTER TABLE "WatchlistDigestLog" ADD CONSTRAINT "WatchlistDigestLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
