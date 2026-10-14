-- CreateTable
CREATE TABLE "LearnArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "ctaHref" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearnArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearnArticleLocale" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "paragraphs" JSONB NOT NULL,

    CONSTRAINT "LearnArticleLocale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LearnArticle_slug_key" ON "LearnArticle"("slug");

-- CreateIndex
CREATE INDEX "LearnArticle_status_sortOrder_idx" ON "LearnArticle"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "LearnArticle_category_status_idx" ON "LearnArticle"("category", "status");

-- CreateIndex
CREATE INDEX "LearnArticleLocale_locale_idx" ON "LearnArticleLocale"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "LearnArticleLocale_articleId_locale_key" ON "LearnArticleLocale"("articleId", "locale");

-- AddForeignKey
ALTER TABLE "LearnArticleLocale" ADD CONSTRAINT "LearnArticleLocale_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "LearnArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
