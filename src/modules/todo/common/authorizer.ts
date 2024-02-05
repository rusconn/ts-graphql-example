import type { Todo, User } from "@/prisma/mod.ts";
import { AuthorizationError, authAdmin } from "../../common/authorizers.ts";
import type { ContextUser } from "../../common/resolvers.ts";

export const authAdminOrTodoOwner = (user: ContextUser, todo: Pick<Todo, "userId">) => {
  try {
    return authAdmin(user);
  } catch {
    return authTodoOwner(user, todo);
  }
};

export const authTodoOwner = (user: ContextUser, todo: Pick<Todo, "userId">) => {
  if (user.id === todo.userId) return user;
  throw new AuthorizationError();
};

export const authAdminOrUserOwner = (user: ContextUser, parent: Pick<User, "id">) => {
  try {
    return authAdmin(user);
  } catch {
    return authUserOwner(user, parent);
  }
};

const authUserOwner = (user: ContextUser, parent: Pick<User, "id">) => {
  if (user.id === parent.id) return user;
  throw new AuthorizationError();
};
