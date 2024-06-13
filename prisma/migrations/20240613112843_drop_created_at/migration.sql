/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Todo` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Todo_userId_createdAt_id_idx";

-- DropIndex
DROP INDEX "User_createdAt_id_idx";

-- AlterTable
ALTER TABLE "Todo" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt";

-- CreateIndex
CREATE INDEX "Todo_userId_id_idx" ON "Todo"("userId", "id");
