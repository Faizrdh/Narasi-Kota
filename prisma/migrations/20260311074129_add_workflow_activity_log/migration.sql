-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('IDE', 'PENUGASAN', 'MENULIS', 'REVIEW', 'REVISI', 'SIAP_PUBLISH', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('TINGGI', 'SEDANG', 'RENDAH');

-- CreateTable
CREATE TABLE "article_workflows" (
    "id" TEXT NOT NULL,
    "judulBerita" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "subKategori" TEXT,
    "workflowStatus" "WorkflowStatus" NOT NULL DEFAULT 'IDE',
    "priority" "Priority" NOT NULL DEFAULT 'SEDANG',
    "deadline" TIMESTAMP(3),
    "reporterId" TEXT,
    "editorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "actorId" TEXT,
    "workflowId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "article_workflows" ADD CONSTRAINT "article_workflows_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_workflows" ADD CONSTRAINT "article_workflows_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "article_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
