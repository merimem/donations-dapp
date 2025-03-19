/*
  Warnings:

  - A unique constraint covering the columns `[projectId]` on the table `ProjectList` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ProjectList" ADD COLUMN     "projectId" TEXT NOT NULL DEFAULT 'TEMPORARY_ID';

-- CreateIndex
CREATE UNIQUE INDEX "ProjectList_projectId_key" ON "ProjectList"("projectId");
