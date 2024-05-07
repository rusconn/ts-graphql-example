import type * as DB from "@/db/mod.ts";
import { type Context, notFoundErr } from "../../common/resolvers.ts";

export type User = DB.UserSelect;

export const getUser = async (context: Pick<Context, "loaders">, key: DB.UserKey) => {
  const user = await context.loaders.user.load(key);

  if (!user) {
    throw notFoundErr();
  }

  return user;
};
