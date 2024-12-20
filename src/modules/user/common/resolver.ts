import type { Context } from "../../../context.ts";
import type { UserKey } from "../../../db/loaders/mod.ts";
import type { UserSelect } from "../../../db/models.ts";

export type User = UserSelect;

export const getUser = async (context: Pick<Context, "loaders">, key: UserKey) => {
  return await context.loaders.user.load(key);
};
