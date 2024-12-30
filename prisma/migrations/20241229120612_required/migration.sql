/*
  Warnings:

  - Made the column `updatedAt` on table `DeletedPost` required. This step will fail if there are existing NULL values in that column.
  - Made the column `content` on table `DeletedPost` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `DeletedPost` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "DeletedPost" ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "content" SET NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;
