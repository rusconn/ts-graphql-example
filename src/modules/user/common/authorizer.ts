import type { User } from "@/prisma/mod.ts";
import { isAdmin, AuthorizationError } from "../../common/authorizers.ts";
import type { ContextUser } from "../../common/resolvers.ts";

export const isAdminOrUserOwner = (user: ContextUser, parent: Pick<User, "id">) => {
  try {
    return isAdmin(user);
  } catch {
    return isUserOwner(user, parent);
  }
};

export const isUserOwner = (user: ContextUser, parent: Pick<User, "id">) => {
  if (user.id === parent.id) return user;
  throw new AuthorizationError();
};
