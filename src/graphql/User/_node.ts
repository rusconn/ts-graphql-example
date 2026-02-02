import type { Context } from "../../context.ts";
import type { User } from "../../domain/user.ts";

export const getNode = async (ctx: Pick<Context, "queries">, id: User["id"]) => {
  return await ctx.queries.user.findById(id);
};
