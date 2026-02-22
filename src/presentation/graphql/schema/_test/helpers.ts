import type { Transaction } from "kysely";

import { createAppContext } from "../../../../application/context.ts";
import type { DB } from "../../../../infrastructure/datasources/_shared/types.ts";
import { pino } from "../../../../infrastructure/loggers/pino.ts";
import type { Context } from "../../yoga/context.ts";
import type { ContextForIT } from "./data/context/dynamic.ts";
import * as todos from "./data/graph/todos.ts";
import * as users from "./data/graph/users.ts";

export const dummyId = {
  todo: todos.dummyId,
  user: users.dummyId,
};

export const createContext = (ctx: ContextForIT, trx: Transaction<DB>): Context => {
  return {
    request: ctx.request,
    ...createAppContext({ user: ctx.user, logger: pino, kysely: trx }),
  } as Context;
};
