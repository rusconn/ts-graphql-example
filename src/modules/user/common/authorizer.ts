import { isAdmin, AuthorizationError } from "../../common/authorizers.js";
import type { ContextUser } from "../../common/resolvers.js";
import type { ResolversParentTypes } from "../../common/schema.js";

type ParentUser = ResolversParentTypes["User"];

export const isAdminOrUserOwner = (user: ContextUser, parent: ParentUser) => {
  try {
    return isAdmin(user);
  } catch {
    return isUserOwner(user, parent);
  }
};

export const isUserOwner = (user: ContextUser, parent: ParentUser) => {
  if (user.id === parent.id) return user;
  throw new AuthorizationError();
};
