import type { Context } from "../../../context.ts";
import type { UserKey } from "../../../db/loaders/mod.ts";
import type { UserSelect } from "../../../db/models.ts";
import { notFoundErr } from "../../common/resolvers.ts";

export type User = UserSelect;

export const getUser = async (context: Pick<Context, "loaders">, key: UserKey) => {
  const user = await context.loaders.user.load(key);

  if (!user) {
    throw notFoundErr();
  }

  return user;
};
