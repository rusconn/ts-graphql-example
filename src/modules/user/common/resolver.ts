import type * as DB from "@/db/mod.ts";
import { type Context, notFoundErr } from "../../common/resolvers.ts";

export type User = DB.UserKey;

export const getUser = async (context: Pick<Context, "loaders">, key: User) => {
  const user = await context.loaders.user.load(key);

  if (!user) {
    throw notFoundErr();
  }

  return user;
};
