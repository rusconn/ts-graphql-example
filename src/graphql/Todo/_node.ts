import type { Context } from "../../context.ts";
import type { Todo } from "../../domain/todo.ts";

export const getNode = async (context: Pick<Context, "queries">, id: Todo["id"]) => {
  return await context.queries.todo.find(id);
};
