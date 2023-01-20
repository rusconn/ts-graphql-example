import { chain, race, rule } from "graphql-shield";

import { toUserNodeId } from "@/graphql/adapters";
import { ParseError } from "@/graphql/errors";
import type { Graph } from "@/graphql/types";
import { isAdmin, isAuthenticated, newPermissionError } from "@/graphql/utils";
import type { Context } from "@/types";
import { parsers } from "./parsers";

type QueryOrUpdateOrDeleteTodosArgs =
  | Graph.QueryMyTodoArgs
  | Graph.MutationUpdateTodoArgs
  | Graph.MutationDeleteTodoArgs;

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

const isMine = rule({ cache: "strict" })(
  (_, { userId }: Graph.MutationCreateTodoArgs, { user }: Context) => {
    return userId === toUserNodeId(user.id) || newPermissionError();
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
    createTodo: race(isAdmin, chain(isAuthenticated, isMine)),
    updateTodo: race(isAdmin, chain(isAuthenticated, isTodoOwner)),
    deleteTodo: race(isAdmin, chain(isAuthenticated, isTodoOwner)),
    completeTodo: race(isAdmin, chain(isAuthenticated, isTodoOwner)),
    uncompleteTodo: race(isAdmin, chain(isAuthenticated, isTodoOwner)),
  },
  Todo: {
    user: race(isAdmin, isSelf),
  },
};
