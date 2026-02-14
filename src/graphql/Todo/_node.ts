import type { Todo } from "../../domain/models.ts";
import type { ContextForAuthed } from "../../server/context.ts";

export const getNode = async (ctx: ContextForAuthed, id: Todo.Type["id"]) => {
  return await ctx.queries.todo.find(id);
};
