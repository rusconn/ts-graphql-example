import { chain, race, rule } from "graphql-shield";

import { toUserNodeId } from "@/adapters";
import * as DataSource from "@/datasources";
import type { Graph } from "@/graphql/types";
import { permissionError, isAdmin, isAuthenticated } from "@/graphql/utils";
import type { Context } from "@/server/types";
import { parsers } from "./parsers";

type QueryOrUpdateOrDeleteTodosArgs =
  | Graph.QueryTodoArgs
  | Graph.MutationUpdateTodoArgs
  | Graph.MutationDeleteTodoArgs;

type Parent = Graph.ResolversParentTypes["Todo"];

const isTodosOwner = rule({ cache: "strict" })(
  (_, { userId }: Graph.QueryTodosArgs, { user }: Context) => {
    return userId === toUserNodeId(user.id) || permissionError;
  }
);

const isTodoOwner = rule({ cache: "strict" })(
  async (_, args: QueryOrUpdateOrDeleteTodosArgs, { user, dataSources: { todoAPI } }: Context) => {
    const parsed = parsers.Query.todo(args);

    let todo;

    try {
      todo = await todoAPI.get(parsed);
    } catch (e) {
      if (e instanceof DataSource.NotFoundError) {
        return false;
      }

      throw e;
    }

    return todo.userId === user.id || permissionError;
  }
);

const isMine = rule({ cache: "strict" })(
  (_, { userId }: Graph.MutationCreateTodoArgs, { user }: Context) => {
    return userId === toUserNodeId(user.id) || permissionError;
  }
);

const isSelf = rule({ cache: "strict" })(({ userId }: Parent, _, { user }: Context) => {
  return userId === user.id || permissionError;
});

export const permissions = {
  Query: {
    todos: race(isAdmin, chain(isAuthenticated, isTodosOwner)),
    todo: race(isAdmin, chain(isAuthenticated, isTodoOwner)),
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
