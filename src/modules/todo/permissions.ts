import { or, rule } from "graphql-shield";

import type * as Graph from "../common/schema";
import type { Context } from "../common/resolvers";
import { isAdmin, isAuthenticated, newPermissionError } from "../common/permissions";
import { parsers } from "./parsers";

type ParentTodo = Graph.ResolversParentTypes["Todo"];
type ParentUser = Graph.ResolversParentTypes["User"];

const isTodoOwner = rule({ cache: "strict" })(({ userId }: ParentTodo, _, { user }: Context) => {
  return userId === user.id || newPermissionError();
});

const isUserOwner = rule({ cache: "strict" })(({ id }: ParentUser, _, { user }: Context) => {
  return id === user.id || newPermissionError();
});

const isUserTodoOwner = rule({ cache: "strict" })(
  async (_, args: Graph.UserTodoArgs, { dataSources: { prisma }, user }: Context) => {
    const { id } = parsers.User.todo(args);

    const todo = await prisma.todo.findUniqueOrThrow({
      where: { id },
      select: { userId: true },
    });

    return todo.userId === user.id || newPermissionError();
  }
);

export default {
  Mutation: {
    createTodo: isAuthenticated,
    updateTodo: isAuthenticated,
    deleteTodo: isAuthenticated,
    completeTodo: isAuthenticated,
    uncompleteTodo: isAuthenticated,
  },
  Todo: {
    id: or(isAdmin, isTodoOwner),
    createdAt: or(isAdmin, isTodoOwner),
    updatedAt: or(isAdmin, isTodoOwner),
    title: isTodoOwner,
    description: isTodoOwner,
    status: isTodoOwner,
    user: or(isAdmin, isTodoOwner),
  },
  User: {
    todo: or(isAdmin, isUserTodoOwner),
    todos: or(isAdmin, isUserOwner),
  },
};
