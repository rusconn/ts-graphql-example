import { authAdmin, authErr } from "../../common/authorizers.ts";
import type { Context } from "../../common/resolvers.ts";
import type { User } from "./resolver.ts";

export const authAdminOrUserOwner = (context: Pick<Context, "user">, user: Pick<User, "id">) => {
  try {
    return authAdmin(context);
  } catch {
    return authUserOwner(context, user);
  }
};

export const authUserOwner = (context: Pick<Context, "user">, user: Pick<User, "id">) => {
  if (context.user?.id === user.id) return context.user;
  throw authErr();
};
