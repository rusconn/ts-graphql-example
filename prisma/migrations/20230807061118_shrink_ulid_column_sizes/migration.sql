/*
  Warnings:

  - The primary key for the `Todo` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Todo` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `Char(26)`.
  - You are about to alter the column `userId` on the `Todo` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `Char(26)`.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `token` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `Char(26)`.
  - You are about to alter the column `id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `Char(26)`.

*/
-- DropForeignKey
ALTER TABLE "Todo" DROP CONSTRAINT "Todo_userId_fkey";

-- AlterTable
ALTER TABLE "Todo" DROP CONSTRAINT "Todo_pkey",
ALTER COLUMN "id" SET DATA TYPE CHAR(26),
ALTER COLUMN "userId" SET DATA TYPE CHAR(26),
ADD CONSTRAINT "Todo_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "token" SET DATA TYPE CHAR(26),
ALTER COLUMN "id" SET DATA TYPE CHAR(26),
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
