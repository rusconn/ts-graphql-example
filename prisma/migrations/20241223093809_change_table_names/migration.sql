/*
  Warnings:

  - You are about to drop the `BlockerBlockee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FollowerFollowee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LikerPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostHashtag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BlockerBlockee" DROP CONSTRAINT "BlockerBlockee_blockeeId_fkey";

-- DropForeignKey
ALTER TABLE "BlockerBlockee" DROP CONSTRAINT "BlockerBlockee_blockerId_fkey";

-- DropForeignKey
ALTER TABLE "FollowerFollowee" DROP CONSTRAINT "FollowerFollowee_followeeId_fkey";

-- DropForeignKey
ALTER TABLE "FollowerFollowee" DROP CONSTRAINT "FollowerFollowee_followerId_fkey";

-- DropForeignKey
ALTER TABLE "LikerPost" DROP CONSTRAINT "LikerPost_postId_fkey";

-- DropForeignKey
ALTER TABLE "LikerPost" DROP CONSTRAINT "LikerPost_userId_fkey";

-- DropForeignKey
ALTER TABLE "PostHashtag" DROP CONSTRAINT "PostHashtag_hashtagId_fkey";

-- DropForeignKey
ALTER TABLE "PostHashtag" DROP CONSTRAINT "PostHashtag_postId_fkey";

-- DropTable
DROP TABLE "BlockerBlockee";

-- DropTable
DROP TABLE "FollowerFollowee";

-- DropTable
DROP TABLE "LikerPost";

-- DropTable
DROP TABLE "PostHashtag";

-- CreateTable
CREATE TABLE "Block" (
    "id" UUID NOT NULL,
    "blockerId" UUID NOT NULL,
    "blockeeId" UUID NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" UUID NOT NULL,
    "followerId" UUID NOT NULL,
    "followeeId" UUID NOT NULL,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "postId" UUID NOT NULL,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "postId" UUID NOT NULL,
    "hashtagId" UUID NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("postId","hashtagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Block_blockerId_blockeeId_key" ON "Block"("blockerId", "blockeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followeeId_key" ON "Follow"("followerId", "followeeId");

-- CreateIndex
CREATE INDEX "Like_postId_idx" ON "Like"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_postId_key" ON "Like"("userId", "postId");

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockeeId_fkey" FOREIGN KEY ("blockeeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followeeId_fkey" FOREIGN KEY ("followeeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_hashtagId_fkey" FOREIGN KEY ("hashtagId") REFERENCES "Hashtag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
