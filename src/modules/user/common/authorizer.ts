import type { User } from "@/prisma/mod.js";
import { isAdmin, AuthorizationError } from "../../common/authorizers.js";
import type { ContextUser } from "../../common/resolvers.js";

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
