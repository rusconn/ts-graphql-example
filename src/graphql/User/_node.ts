import type { ContextForAuthed } from "../../context.ts";
import type { Type } from "../../domain/user.ts";

export const getNode = async (ctx: ContextForAuthed, id: Type["id"]) => {
  return await ctx.queries.user.findById(id);
};
