import type { ContextForAuthed } from "../../context.ts";
import type { Type } from "../../domain/todo.ts";

export const getNode = async (ctx: ContextForAuthed, id: Type["id"]) => {
  return await ctx.queries.todo.find(id);
};
