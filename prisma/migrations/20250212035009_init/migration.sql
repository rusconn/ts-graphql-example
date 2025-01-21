-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('Active', 'Deleted');

-- CreateTable
CREATE TABLE "Block" (
    "createdAt" TIMESTAMP(3) NOT NULL,
    "blockerId" UUID NOT NULL,
    "blockeeId" UUID NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("blockerId","blockeeId")
);

-- CreateTable
CREATE TABLE "Follow" (
    "createdAt" TIMESTAMP(3) NOT NULL,
    "followerId" UUID NOT NULL,
    "followeeId" UUID NOT NULL,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("followerId","followeeId")
);

-- CreateTable
CREATE TABLE "Like" (
    "createdAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID NOT NULL,
    "postId" UUID NOT NULL,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("userId","postId")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" VARCHAR(280) NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'Active',
    "authorId" UUID NOT NULL,
    "parentId" UUID,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

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

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Like_postId_idx" ON "Like"("postId");

-- CreateIndex
CREATE INDEX "Post_updatedAt_id_idx" ON "Post"("updatedAt", "id");

-- CreateIndex
CREATE INDEX "Post_authorId_id_idx" ON "Post"("authorId", "id");

-- CreateIndex
CREATE INDEX "Post_authorId_updatedAt_id_idx" ON "Post"("authorId", "updatedAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX "UserToken_token_key" ON "UserToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

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
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCredential" ADD CONSTRAINT "UserCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToken" ADD CONSTRAINT "UserToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
