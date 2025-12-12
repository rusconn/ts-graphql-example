import type { Context } from "../../context.ts";
import type { Todo } from "../../domain/todo.ts";

export const getNode = async (context: Pick<Context, "repos">, id: Todo["id"]) => {
  return await context.repos.todo.find(id);
};
