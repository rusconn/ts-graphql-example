import type { Context } from "../../../context.ts";
import type { UserKey } from "../../../db/loaders/mod.ts";

export const getUser = async (context: Pick<Context, "loaders">, key: UserKey) => {
  return await context.loaders.user.load(key);
};
