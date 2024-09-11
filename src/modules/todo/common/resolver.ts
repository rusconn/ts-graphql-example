import type { Context } from "../../../context.ts";
import type { TodoKey } from "../../../db/loaders/mod.ts";
import { notFoundErr } from "../../common/resolvers.ts";

export type Todo = TodoKey;

export const getTodo = async (context: Pick<Context, "loaders">, key: TodoKey) => {
  const todo = await context.loaders.todo.load(key);

  if (!todo) {
    throw notFoundErr();
  }

  return todo;
};
