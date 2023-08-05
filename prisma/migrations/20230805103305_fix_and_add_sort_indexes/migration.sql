-- DropIndex
DROP INDEX "Todo_createdAt_id_idx";

-- DropIndex
DROP INDEX "Todo_updatedAt_id_idx";

-- DropIndex
DROP INDEX "User_createdAt_id_idx";

-- DropIndex
DROP INDEX "User_updatedAt_id_idx";

-- CreateIndex
CREATE INDEX "Todo_createdAt_id_idx" ON "Todo"("createdAt" ASC, "id" ASC);

-- CreateIndex
CREATE INDEX "Todo_createdAt_desc_id_desc_idx" ON "Todo"("createdAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "Todo_updatedAt_id_idx" ON "Todo"("updatedAt" ASC, "id" ASC);

-- CreateIndex
CREATE INDEX "Todo_updatedAt_desc_id_desc_idx" ON "Todo"("updatedAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "User_createdAt_id_idx" ON "User"("createdAt" ASC, "id" ASC);

-- CreateIndex
CREATE INDEX "User_createdAt_desc_id_desc_idx" ON "User"("createdAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "User_updatedAt_id_idx" ON "User"("updatedAt" ASC, "id" ASC);

-- CreateIndex
CREATE INDEX "User_updatedAt_desc_id_desc_idx" ON "User"("updatedAt" DESC, "id" DESC);
