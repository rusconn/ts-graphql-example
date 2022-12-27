-- CreateEnum
CREATE TYPE "TodoStatus" AS ENUM ('DONE', 'PENDING');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER', 'GUEST');

-- CreateTable
CREATE TABLE "Todo" (
    "id" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL DEFAULT E'',
    "status" "TodoStatus" NOT NULL DEFAULT E'PENDING',
    "userId" VARCHAR(255) NOT NULL,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT E'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Todo_userId_idx" ON "Todo"("userId");

-- CreateIndex
CREATE INDEX "Todo_createdAt_id_idx" ON "Todo"("createdAt" DESC, "id");

-- CreateIndex
CREATE INDEX "Todo_updatedAt_id_idx" ON "Todo"("updatedAt" DESC, "id");

-- CreateIndex
CREATE UNIQUE INDEX "User_token_key" ON "User"("token");

-- CreateIndex
CREATE INDEX "User_createdAt_id_idx" ON "User"("createdAt" DESC, "id");

-- CreateIndex
CREATE INDEX "User_updatedAt_id_idx" ON "User"("updatedAt" DESC, "id");

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
