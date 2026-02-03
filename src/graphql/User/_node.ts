import type { ContextForAuthed } from "../../context.ts";
import type { User } from "../../domain/user.ts";

export const getNode = async (ctx: ContextForAuthed, id: User["id"]) => {
  return await ctx.queries.user.findById(id);
};
