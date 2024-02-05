import type { User } from "@/prisma/mod.ts";
import { AuthorizationError, authAdmin } from "../../common/authorizers.ts";
import type { ContextUser } from "../../common/resolvers.ts";

export const authAdminOrUserOwner = (user: ContextUser, parent: Pick<User, "id">) => {
  try {
    return authAdmin(user);
  } catch {
    return authUserOwner(user, parent);
  }
};

export const authUserOwner = (user: ContextUser, parent: Pick<User, "id">) => {
  if (user.id === parent.id) return user;
  throw new AuthorizationError();
};
