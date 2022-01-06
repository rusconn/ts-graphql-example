import { PrismaClient } from "@prisma/client";

export const makePrismaClient = (isDev: boolean) => {
  const prisma = new PrismaClient({
    log: isDev ? ["query", "info", "warn", "error"] : ["info", "warn", "error"],
  });

  prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = (await next(params)) as unknown;
    const after = Date.now();
    console.log(`Query ${params.model ?? "model"}.${params.action} took ${after - before}ms`);
    return result;
  });

  return prisma;
};
