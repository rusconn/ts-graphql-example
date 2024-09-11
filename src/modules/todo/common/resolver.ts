import type * as DB from "@/db/mod.ts";
import { type Context, notFoundErr } from "../../common/resolvers.ts";

export type Todo = DB.TodoKey;

export const getTodo = async (context: Pick<Context, "loaders">, key: Todo) => {
  const todo = await context.loaders.todo.load(key);

  if (!todo) {
    throw notFoundErr();
  }

  return todo;
};
