import { Prisma, PrismaClient } from "@prisma/client";

import { InputTooLongError, NotFoundError, DataSourceError } from "@/datasources";

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

  prisma.$use(async (params, next) => {
    try {
      return (await next(params)) as unknown;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        switch (e.code) {
          case "P2000":
            throw new InputTooLongError(e);
          case "P2001":
          case "P2025":
            throw new NotFoundError(e);
          default:
            throw new DataSourceError(e);
        }
      }

      throw e;
    }
  });

  return prisma;
};
