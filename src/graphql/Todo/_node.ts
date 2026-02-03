import type { ContextForAuthed } from "../../context.ts";
import type { Todo } from "../../domain/todo.ts";

export const getNode = async (ctx: ContextForAuthed, id: Todo["id"]) => {
  return await ctx.queries.todo.find(id);
};
