import type { Context } from "../../../context.ts";
import type { TodoKey } from "../../../db/loaders/mod.ts";
import type { TodoSelect } from "../../../db/models.ts";

export type Todo = TodoSelect;

export const getTodo = async (context: Pick<Context, "loaders">, key: TodoKey) => {
  return await context.loaders.todo.load(key);
};
