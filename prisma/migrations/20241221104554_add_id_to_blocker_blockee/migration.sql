/*
  Warnings:

  - The primary key for the `BlockerBlockee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[blockerId,blockeeId]` on the table `BlockerBlockee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `BlockerBlockee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BlockerBlockee" DROP CONSTRAINT "BlockerBlockee_pkey",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "BlockerBlockee_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "BlockerBlockee_blockerId_blockeeId_key" ON "BlockerBlockee"("blockerId", "blockeeId");
