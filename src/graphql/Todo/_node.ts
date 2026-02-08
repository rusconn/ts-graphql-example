import type { ContextForAuthed } from "../../server/context.ts";
import type { Todo } from "../../domain/models.ts";

export const getNode = async (ctx: ContextForAuthed, id: Todo.Type["id"]) => {
  return await ctx.queries.todo.find(id);
};
