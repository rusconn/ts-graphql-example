import type { Context } from "./resolvers.ts";

export const dummyContext = ({
  requestId = "18676CF1-FC39-4E96-B980-C80728E3B97D",
  prisma = dummyPrisma,
  user,
}: {
  requestId?: Context["requestId"];
  prisma?: Context["prisma"];
  user: Context["user"];
}) => {
  return { requestId, prisma, user } as Context;
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
