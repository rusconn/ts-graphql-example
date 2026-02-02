import type { Context } from "../../context.ts";
import type { Todo } from "../../domain/todo.ts";

export const getNode = async (ctx: Pick<Context, "queries">, id: Todo["id"]) => {
  return await ctx.queries.todo.find(id);
};
