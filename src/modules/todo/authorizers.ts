import type { Todo } from "@/prisma";
import type * as Graph from "../common/schema";
import { isAuthenticated, isAdmin, AuthorizationError } from "../common/authorizers";
import type { ContextUser } from "../common/resolvers";

type ParentUserId = Graph.ResolversParentTypes["User"]["id"];

const isTodoOwner = (user: ContextUser, todo: Pick<Todo, "userId">) => {
  if (user.id === todo.userId) return user;
  throw new AuthorizationError();
};

const isUserOwner = (user: ContextUser, id: ParentUserId) => {
  if (user.id === id) return user;
  throw new AuthorizationError();
};

const isAdminOrTodoOwner = (user: ContextUser, todo: Pick<Todo, "userId">) => {
  try {
    return isAdmin(user);
  } catch {
    return isTodoOwner(user, todo);
  }
};

const isAdminOrUserOwner = (user: ContextUser, id: ParentUserId) => {
  try {
    return isAdmin(user);
  } catch {
    return isUserOwner(user, id);
  }
};

export const authorizers = {
  Mutation: {
    createTodo: isAuthenticated,
    updateTodo: isAuthenticated,
    deleteTodo: isAuthenticated,
    completeTodo: isAuthenticated,
    uncompleteTodo: isAuthenticated,
  },
  Todo: {
    id: isAdminOrTodoOwner,
    createdAt: isAdminOrTodoOwner,
    updatedAt: isAdminOrTodoOwner,
    title: isTodoOwner,
    description: isTodoOwner,
    status: isTodoOwner,
    user: isAdminOrTodoOwner,
  },
  User: {
    todo: isAdminOrUserOwner,
    todos: isAdminOrUserOwner,
  },
};
