import { or, rule } from "graphql-shield";

import type { Graph } from "@/graphql/types";
import { isAdmin, isAuthenticated, newPermissionError } from "@/graphql/utils";
import type { Context } from "@/types";

type Parent = Graph.ResolversParentTypes["Todo"];

const isOwner = rule({ cache: "strict" })(({ userId }: Parent, _, { user }: Context) => {
  return userId === user.id || newPermissionError();
});

export const permissions = {
  Query: {
    myTodos: isAuthenticated,
    myTodo: isAuthenticated,
  },
  Mutation: {
    createMyTodo: isAuthenticated,
    updateMyTodo: isAuthenticated,
    deleteMyTodo: isAuthenticated,
    completeMyTodo: isAuthenticated,
    uncompleteMyTodo: isAuthenticated,
  },
  Todo: {
    title: isOwner,
    description: isOwner,
    status: isOwner,
    user: or(isAdmin, isOwner),
  },
};
