import type { Context } from "../../../context.ts";
import type { UserKey } from "../../../db/loaders/mod.ts";
import { notFoundErr } from "../../common/resolvers.ts";

export type User = UserKey;

export const getUser = async (context: Pick<Context, "loaders">, key: UserKey) => {
  const user = await context.loaders.user.load(key);

  if (!user) {
    throw notFoundErr();
  }

  return user;
};
