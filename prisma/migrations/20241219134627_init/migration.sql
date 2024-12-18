-- CreateTable
CREATE TABLE "BlockerBlockee" (
    "blockerId" UUID NOT NULL,
    "blockeeId" UUID NOT NULL,

    CONSTRAINT "BlockerBlockee_pkey" PRIMARY KEY ("blockerId","blockeeId")
);

-- CreateTable
CREATE TABLE "FollowerFollowee" (
    "followerId" UUID NOT NULL,
    "followeeId" UUID NOT NULL,

    CONSTRAINT "FollowerFollowee_pkey" PRIMARY KEY ("followerId","followeeId")
);

-- CreateTable
CREATE TABLE "Hashtag" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "Hashtag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LikerPost" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "postId" UUID NOT NULL,

    CONSTRAINT "LikerPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostHashtag" (
    "postId" UUID NOT NULL,
    "hashtagId" UUID NOT NULL,

    CONSTRAINT "PostHashtag_pkey" PRIMARY KEY ("postId","hashtagId")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" VARCHAR(280) NOT NULL,
    "userId" UUID NOT NULL,
    "parentId" UUID,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "avatar" VARCHAR(300),
    "name" VARCHAR(15) NOT NULL,
    "handle" VARCHAR(50) NOT NULL,
    "bio" VARCHAR(160) NOT NULL DEFAULT '',
    "location" VARCHAR(30) NOT NULL DEFAULT '',
    "website" VARCHAR(100) NOT NULL DEFAULT '',
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "token" UUID,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hashtag_name_key" ON "Hashtag"("name");

-- CreateIndex
CREATE INDEX "LikerPost_postId_idx" ON "LikerPost"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "LikerPost_userId_postId_key" ON "LikerPost"("userId", "postId");

-- NOTE: 手で追加した
-- CreateIndex
CREATE INDEX "Post_parentId_idx" ON "Post"("parentId") WHERE "parentId" IS NOT NULL;

-- CreateIndex
CREATE INDEX "Post_updatedAt_id_idx" ON "Post"("updatedAt", "id");

-- CreateIndex
CREATE INDEX "Post_userId_id_idx" ON "Post"("userId", "id");

-- CreateIndex
CREATE INDEX "Post_userId_updatedAt_id_idx" ON "Post"("userId", "updatedAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_token_key" ON "User"("token");

-- AddForeignKey
ALTER TABLE "BlockerBlockee" ADD CONSTRAINT "BlockerBlockee_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockerBlockee" ADD CONSTRAINT "BlockerBlockee_blockeeId_fkey" FOREIGN KEY ("blockeeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowerFollowee" ADD CONSTRAINT "FollowerFollowee_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowerFollowee" ADD CONSTRAINT "FollowerFollowee_followeeId_fkey" FOREIGN KEY ("followeeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikerPost" ADD CONSTRAINT "LikerPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikerPost" ADD CONSTRAINT "LikerPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostHashtag" ADD CONSTRAINT "PostHashtag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostHashtag" ADD CONSTRAINT "PostHashtag_hashtagId_fkey" FOREIGN KEY ("hashtagId") REFERENCES "Hashtag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
