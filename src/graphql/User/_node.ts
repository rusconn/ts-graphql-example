import type { Context } from "../../context.ts";
import type { User } from "../../domain/user.ts";

export const getNode = async (context: Pick<Context, "repos">, id: User["id"]) => {
  return await context.repos.user.findBaseById(id);
};
