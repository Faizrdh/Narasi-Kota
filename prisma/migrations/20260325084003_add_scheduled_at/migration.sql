-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "scheduledAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "articles_status_scheduledAt_idx" ON "articles"("status", "scheduledAt");
