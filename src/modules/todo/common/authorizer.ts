import type { Todo } from "@/prisma/mod.js";
import type { ResolversParentTypes } from "../../common/schema.js";
import { isAdmin, AuthorizationError } from "../../common/authorizers.js";
import type { ContextUser } from "../../common/resolvers.js";

type ParentUser = ResolversParentTypes["User"];

export const isAdminOrTodoOwner = (user: ContextUser, todo: Pick<Todo, "userId">) => {
  try {
    return isAdmin(user);
  } catch {
    return isTodoOwner(user, todo);
  }
};

export const isTodoOwner = (user: ContextUser, todo: Pick<Todo, "userId">) => {
  if (user.id === todo.userId) return user;
  throw new AuthorizationError();
};

export const isAdminOrUserOwner = (user: ContextUser, parent: ParentUser) => {
  try {
    return isAdmin(user);
  } catch {
    return isUserOwner(user, parent);
  }
};

const isUserOwner = (user: ContextUser, parent: ParentUser) => {
  if (user.id === parent.id) return user;
  throw new AuthorizationError();
};
