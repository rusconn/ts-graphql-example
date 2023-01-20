import { chain, race, rule } from "graphql-shield";

import { ParseError } from "@/graphql/errors";
import type { Graph } from "@/graphql/types";
import { isAdmin, isAuthenticated, newPermissionError } from "@/graphql/utils";
import type { Context } from "@/types";
import { parsers } from "./parsers";

type QueryOrUpdateOrDeleteTodosArgs =
  | Graph.QueryMyTodoArgs
  | Graph.MutationUpdateMyTodoArgs
  | Graph.MutationDeleteMyTodoArgs;

type Parent = Graph.ResolversParentTypes["Todo"];

const isTodoOwner = rule({ cache: "strict" })(
  async (_, args: QueryOrUpdateOrDeleteTodosArgs, { user, dataSources: { todoAPI } }: Context) => {
    let parsed;

    try {
      parsed = parsers.Query.myTodo(args);
    } catch (e) {
      return e instanceof ParseError;
    }

    const todo = await todoAPI.getOptional(parsed);

    return !todo || todo.userId === user.id || newPermissionError();
  }
);

const isSelf = rule({ cache: "strict" })(({ userId }: Parent, _, { user }: Context) => {
  return userId === user.id || newPermissionError();
});

export const permissions = {
  Query: {
    myTodos: isAuthenticated,
    myTodo: chain(isAuthenticated, isTodoOwner),
  },
  Mutation: {
    createMyTodo: isAuthenticated,
    updateMyTodo: chain(isAuthenticated, isTodoOwner),
    deleteMyTodo: chain(isAuthenticated, isTodoOwner),
    completeMyTodo: chain(isAuthenticated, isTodoOwner),
    uncompleteMyTodo: chain(isAuthenticated, isTodoOwner),
  },
  Todo: {
    user: race(isAdmin, isSelf),
  },
};
