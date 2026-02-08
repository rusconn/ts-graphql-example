import type { ContextForAuthed } from "../../server/context.ts";
import type { User } from "../../domain/models.ts";

export const getNode = async (ctx: ContextForAuthed, id: User.Type["id"]) => {
  return await ctx.queries.user.find(id);
};
