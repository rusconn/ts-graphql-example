import { makePrismaClient } from "@/utils";

// Node.js のモジュールキャッシュ効いてる？
export const prisma = makePrismaClient(false);
