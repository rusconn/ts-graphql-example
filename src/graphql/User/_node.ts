import type { Context } from "../../context.ts";
import type { User } from "../../domain/user.ts";

export const getNode = async (context: Pick<Context, "queries">, id: User["id"]) => {
  return await context.queries.user.findById(id);
};
