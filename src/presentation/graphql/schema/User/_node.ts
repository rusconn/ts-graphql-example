import type { User } from "../../../../domain/entities.ts";
import type { ContextForAuthed } from "../../yoga/context.ts";

export const getNode = async (ctx: ContextForAuthed, id: User.Type["id"]) => {
  return await ctx.queries.user.find(id);
};
