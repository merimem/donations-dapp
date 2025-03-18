/*
  Warnings:

  - You are about to drop the column `amountRaised` on the `ProjectList` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `ProjectList` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ProjectList` table. All the data in the column will be lost.
  - Added the required column `poolType` to the `ProjectList` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectList" DROP COLUMN "amountRaised",
DROP COLUMN "image",
DROP COLUMN "status",
ADD COLUMN     "poolType" TEXT NOT NULL;
