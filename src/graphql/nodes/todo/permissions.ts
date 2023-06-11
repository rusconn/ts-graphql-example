import { or, rule } from "graphql-shield";

import { toUserNodeId } from "@/graphql/adapters";
import type { Graph } from "@/graphql/types";
import { isAdmin, isAuthenticated, newPermissionError } from "@/graphql/utils";
import type { Context } from "@/types";

type ParentTodo = Graph.ResolversParentTypes["Todo"];
type ParentUser = Graph.ResolversParentTypes["User"];

const isTodoOwner = rule({ cache: "strict" })(({ userId }: ParentTodo, _, { user }: Context) => {
  return userId === user.id || newPermissionError();
});

const isUserOwner = rule({ cache: "strict" })(({ id }: ParentUser, _, { user }: Context) => {
  return id === toUserNodeId(user.id) || newPermissionError();
});

export const permissions = {
  Mutation: {
    createTodo: isAuthenticated,
    updateTodo: isAuthenticated,
    deleteTodo: isAuthenticated,
    completeTodo: isAuthenticated,
    uncompleteTodo: isAuthenticated,
  },
  Todo: {
    title: isTodoOwner,
    description: isTodoOwner,
    status: isTodoOwner,
    user: or(isAdmin, isTodoOwner),
  },
  User: {
    todo: or(isAdmin, isUserOwner),
    todos: or(isAdmin, isUserOwner),
  },
};
