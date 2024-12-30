-- CreateTable
CREATE TABLE "DeletedPost" (
    "id" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "content" VARCHAR(280),
    "userId" UUID,
    "parentId" UUID,

    CONSTRAINT "DeletedPost_pkey" PRIMARY KEY ("id")
);
