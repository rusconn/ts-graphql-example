import type { Todo, User } from "@/prisma/mod.ts";
import { isAdmin, AuthorizationError } from "../../common/authorizers.ts";
import type { ContextUser } from "../../common/resolvers.ts";

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

export const isAdminOrUserOwner = (user: ContextUser, parent: Pick<User, "id">) => {
  try {
    return isAdmin(user);
  } catch {
    return isUserOwner(user, parent);
  }
};

const isUserOwner = (user: ContextUser, parent: Pick<User, "id">) => {
  if (user.id === parent.id) return user;
  throw new AuthorizationError();
};
