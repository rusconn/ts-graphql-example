-- DropIndex
DROP INDEX "Todo_createdAt_idx";

-- DropIndex
DROP INDEX "Todo_updatedAt_idx";

-- DropIndex
DROP INDEX "Todo_userId_idx";

-- DropIndex
DROP INDEX "User_createdAt_idx";

-- DropIndex
DROP INDEX "User_updatedAt_idx";

-- CreateIndex
CREATE INDEX "Todo_userId_createdAt_id_idx" ON "Todo"("userId", "createdAt", "id");

-- CreateIndex
CREATE INDEX "Todo_userId_updatedAt_id_idx" ON "Todo"("userId", "updatedAt", "id");

-- CreateIndex
CREATE INDEX "User_createdAt_id_idx" ON "User"("createdAt", "id");

-- CreateIndex
CREATE INDEX "User_updatedAt_id_idx" ON "User"("updatedAt", "id");
