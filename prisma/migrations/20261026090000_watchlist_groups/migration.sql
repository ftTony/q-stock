-- CreateTable
CREATE TABLE "WatchlistGroup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WatchlistGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchlistGroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "WatchlistGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WatchlistGroup_userId_sortOrder_idx" ON "WatchlistGroup"("userId", "sortOrder");

-- CreateIndex
CREATE INDEX "WatchlistGroupMember_itemId_idx" ON "WatchlistGroupMember"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "WatchlistGroupMember_groupId_itemId_key" ON "WatchlistGroupMember"("groupId", "itemId");

-- AddForeignKey
ALTER TABLE "WatchlistGroup" ADD CONSTRAINT "WatchlistGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistGroupMember" ADD CONSTRAINT "WatchlistGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "WatchlistGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistGroupMember" ADD CONSTRAINT "WatchlistGroupMember_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "WatchlistItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
