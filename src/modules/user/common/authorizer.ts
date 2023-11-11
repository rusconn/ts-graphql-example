import { isAdmin, AuthorizationError } from "../../common/authorizers";
import type { ContextUser } from "../../common/resolvers";
import type { ResolversParentTypes } from "../../common/schema";

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
