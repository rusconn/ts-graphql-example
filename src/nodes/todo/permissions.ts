import { chain, race, rule } from "graphql-shield";

import type {
  Context,
  QueryTodosArgs,
  QueryTodoArgs,
  MutationCreateTodoArgs,
  MutationUpdateTodoArgs,
  MutationDeleteTodoArgs,
  ResolversParentTypes,
} from "@/types";
import * as DataSource from "@/datasources";
import { permissionError, isAdmin, isAuthenticated } from "@/utils";

type QueryOrUpdateOrDeleteTodosArgs =
  | QueryTodoArgs
  | MutationUpdateTodoArgs
  | MutationDeleteTodoArgs;
type Parent = ResolversParentTypes["Todo"];

const isTodosOwner = rule({ cache: "strict" })(
  (_, { userId }: QueryTodosArgs, { user }: Context) => {
    return userId === user.id || permissionError;
  }
);

const isTodoOwner = rule({ cache: "strict" })(
  async (
    _,
    { id }: QueryOrUpdateOrDeleteTodosArgs,
    { user, dataSources: { todoAPI } }: Context
  ) => {
    let todo;

    try {
      todo = await todoAPI.get({ id });
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
  (_, { userId }: MutationCreateTodoArgs, { user }: Context) => {
    return userId === user.id || permissionError;
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
