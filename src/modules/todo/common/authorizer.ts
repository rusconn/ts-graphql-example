import type { Todo } from "@/prisma";
import type { ResolversParentTypes } from "../../common/schema";
import { isAdmin, AuthorizationError } from "../../common/authorizers";
import type { ContextUser } from "../../common/resolvers";

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
