import { makePrismaClient } from "@/utils";

/**
 * テスト用の Prisma クライアント
 *
 * Node.js のモジュールキャッシュにより全テストケースで使いまわされる。
 */
export const prisma = makePrismaClient(false);
