import type { Transaction } from "kysely";

import { createAppContext } from "../../../../infrastructure/context.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import { pino } from "../../../../infrastructure/loggers/pino.ts";
import type { Context } from "../../yoga/context.ts";
import type { ContextForIT } from "./data/context/dynamic.ts";
import * as todos from "./data/graph/todos.ts";
import * as users from "./data/graph/users.ts";

export const dummyId = {
  todo: todos.dummyId,
  user: users.dummyId,
};

export function createContext(ctx: ContextForIT, trx: Transaction<DB>): Context {
  return {
    request: ctx.request,
    logger: pino,
    ...createAppContext({ user: ctx.user, kysely: trx }),
  } as Context;
}
