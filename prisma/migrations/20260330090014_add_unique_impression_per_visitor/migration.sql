/*
  Warnings:

  - A unique constraint covering the columns `[articleId,visitorId]` on the table `article_impressions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "article_impressions_articleId_visitorId_key" ON "article_impressions"("articleId", "visitorId");
