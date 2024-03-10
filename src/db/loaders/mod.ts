import type { Kysely } from "kysely";

import type { DB } from "../types.ts";
import * as todo from "./todo.ts";
import * as user from "./user.ts";
import * as userTodos from "./userTodos.ts";
import * as userTodosCount from "./userTodosCount.ts";

export const createLoaders = (db: Kysely<DB>) => ({
  todo: todo.init(db),
  user: user.init(db),
  userTodos: userTodos.initClosure(db),
  userTodosCount: userTodosCount.init(db),
});

export type { Key as TodoKey } from "./todo.ts";
export type { Key as UserKey } from "./user.ts";
