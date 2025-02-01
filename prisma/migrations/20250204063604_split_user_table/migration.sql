/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_token_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
DROP COLUMN "token";

-- CreateTable
CREATE TABLE "UserCredential" (
    "userId" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "password" CHAR(60) NOT NULL,

    CONSTRAINT "UserCredential_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "UserToken" (
    "userId" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "token" UUID NOT NULL,

    CONSTRAINT "UserToken_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserToken_token_key" ON "UserToken"("token");

-- AddForeignKey
ALTER TABLE "UserCredential" ADD CONSTRAINT "UserCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToken" ADD CONSTRAINT "UserToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
