/*
  Warnings:

  - The primary key for the `FollowerFollowee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[followerId,followeeId]` on the table `FollowerFollowee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `FollowerFollowee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FollowerFollowee" DROP CONSTRAINT "FollowerFollowee_pkey",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "FollowerFollowee_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "FollowerFollowee_followerId_followeeId_key" ON "FollowerFollowee"("followerId", "followeeId");
