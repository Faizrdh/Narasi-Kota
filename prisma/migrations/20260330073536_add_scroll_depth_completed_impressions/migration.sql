-- AlterTable
ALTER TABLE "page_views" ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scrollDepth" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "article_impressions" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "visitorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_impressions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "article_impressions_articleId_idx" ON "article_impressions"("articleId");

-- CreateIndex
CREATE INDEX "article_impressions_createdAt_idx" ON "article_impressions"("createdAt");

-- AddForeignKey
ALTER TABLE "article_impressions" ADD CONSTRAINT "article_impressions_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
