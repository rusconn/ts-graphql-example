import type { Context } from "./resolvers.ts";

export const dummyContext = ({
  prisma = dummyPrisma,
  user,
  logger = dummyLogger,
}: {
  prisma?: Context["prisma"];
  user: Context["user"];
  logger?: Context["logger"];
}) => {
  return { prisma, user, logger } as Context;
};

const dummyPrismaActions = {
  findUnique: async () => ({ id: "dummy" }),
  findUniqueOrThrow: async () => ({ id: "dummy" }),
  findMany: async () => [],
  findFirst: async () => ({ id: "dummy" }),
  findFirstOrThrow: async () => ({ id: "dummy" }),
  create: async () => ({ id: "dummy" }),
  createMany: async () => ({ count: 0 }),
  update: async () => ({ id: "dummy" }),
  updateMany: async () => ({ count: 0 }),
  upsert: async () => ({ id: "dummy" }),
  delete: async () => ({ id: "dummy" }),
  deleteMany: async () => ({ count: 0 }),
  executeRaw: async () => {},
  queryRaw: async () => {},
  aggregate: async () => {},
  count: async () => 0,
  runCommandRaw: async () => {},
  findRaw: async () => {},
  groupBy: async () => {},
};

const dummyPrisma = {
  $on: async () => {},
  $connect: async () => {},
  $disconnect: async () => {},
  $use: async () => {},
  $executeRaw: async () => {},
  $executeRawUnsafe: async () => {},
  $queryRaw: async () => {},
  $queryRawUnsafe: async () => {},
  $transaction: async () => {},
  $extends: async () => {},
  todo: dummyPrismaActions,
  user: dummyPrismaActions,
} as unknown as Context["prisma"];

const dummyLogger = {
  trace: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  fatal: () => {},
  silent: () => {},
} as unknown as Context["logger"];
