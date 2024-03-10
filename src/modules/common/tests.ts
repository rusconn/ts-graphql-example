import type { Context } from "./resolvers.ts";

export const dummyContext = ({
  requestId = "18676CF1-FC39-4E96-B980-C80728E3B97D",
  db = dummyDb,
  loaders = dummyLoaders,
  user,
}: {
  requestId?: Context["requestId"];
  db?: object;
  loaders?: object;
  user: Context["user"];
}) => {
  return { requestId, db, loaders, user } as Context;
};

const dummyLoaders = {
  todo: {
    load: async () => ({ id: "dummy" }),
  },
  user: {
    load: async () => ({ id: "dummy" }),
  },
  userTodos: () => ({
    load: async () => [],
  }),
  userTodosCount: {
    load: async () => 0,
  },
};

const dummyDb = {
  selectFrom: () => dummySelectQueryBuilder,
  insertInto: () => dummyInsertQueryBuilder,
  updateTable: () => dummyUpdateQueryBuilder,
  deleteFrom: () => dummyDeleteQueryBuilder,
  transaction: () => dummyTransactionBuilder,
};

const dummySelectQueryBuilder = {
  where: () => dummySelectQueryBuilder,
  whereRef: () => dummySelectQueryBuilder,
  having: () => dummySelectQueryBuilder,
  select: () => dummySelectQueryBuilder,
  selectAll: () => dummySelectQueryBuilder,
  distinct: () => dummySelectQueryBuilder,
  orderBy: () => dummySelectQueryBuilder,
  groupBy: () => dummySelectQueryBuilder,
  limit: () => dummySelectQueryBuilder,
  offset: () => dummySelectQueryBuilder,
  union: () => dummySelectQueryBuilder,
  unionAll: () => dummySelectQueryBuilder,
  intersect: () => dummySelectQueryBuilder,
  intersectAll: () => dummySelectQueryBuilder,
  except: () => dummySelectQueryBuilder,
  exceptAll: () => dummySelectQueryBuilder,
  clearSelect: () => dummySelectQueryBuilder,
  clearWhere: () => dummySelectQueryBuilder,
  clearLimit: () => dummySelectQueryBuilder,
  clearOffset: () => dummySelectQueryBuilder,
  clearOrderBy: () => dummySelectQueryBuilder,
  $if: () => dummySelectQueryBuilder,
  execute: async () => [{ id: "dummy" }],
  executeTakeFirst: async () => ({ id: "dummy" }),
  executeTakeFirstOrThrow: async () => ({ id: "dummy" }),
};

const dummyInsertQueryBuilder = {
  values: () => dummyInsertQueryBuilder,
  columns: () => dummyInsertQueryBuilder,
  defaultValues: () => dummyInsertQueryBuilder,
  returning: () => dummyInsertQueryBuilder,
  returningAll: () => dummyInsertQueryBuilder,
  $if: () => dummyInsertQueryBuilder,
  execute: async () => [{ id: "dummy" }],
  executeTakeFirst: async () => ({ id: "dummy" }),
  executeTakeFirstOrThrow: async () => ({ id: "dummy" }),
};

const dummyUpdateQueryBuilder = {
  where: () => dummyUpdateQueryBuilder,
  whereRef: () => dummyUpdateQueryBuilder,
  clearWhere: () => dummyUpdateQueryBuilder,
  set: () => dummyUpdateQueryBuilder,
  returning: () => dummyUpdateQueryBuilder,
  returningAll: () => dummyUpdateQueryBuilder,
  $if: () => dummyUpdateQueryBuilder,
  execute: async () => [{ id: "dummy" }],
  executeTakeFirst: async () => ({ id: "dummy" }),
  executeTakeFirstOrThrow: async () => ({ id: "dummy" }),
};

const dummyDeleteQueryBuilder = {
  where: () => dummyDeleteQueryBuilder,
  whereRef: () => dummyDeleteQueryBuilder,
  clearWhere: () => dummyDeleteQueryBuilder,
  returning: () => dummyDeleteQueryBuilder,
  returningAll: () => dummyDeleteQueryBuilder,
  orderBy: () => dummyDeleteQueryBuilder,
  limit: () => dummyDeleteQueryBuilder,
  $if: () => dummyDeleteQueryBuilder,
  execute: async () => [{ id: "dummy" }],
  executeTakeFirst: async () => ({ id: "dummy" }),
  executeTakeFirstOrThrow: async () => ({ id: "dummy" }),
};

const dummyTransactionBuilder = {
  setIsolationLevel: () => dummyTransactionBuilder,
  execute: async () => ({ id: "dummy" }),
};
