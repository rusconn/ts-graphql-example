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
import { permissionError, isAdmin, toUserId, isAuthenticated } from "@/utils";

type QueryOrUpdateOrDeleteTodosArgs =
  | QueryTodoArgs
  | MutationUpdateTodoArgs
  | MutationDeleteTodoArgs;
type Parent = ResolversParentTypes["Todo"];

const isTodosOwner = rule({ cache: "strict" })(
  (_, { userId: nodeId }: QueryTodosArgs, { logger, user }: Context) => {
    logger.debug("todo isTodosOwner called");
    const userId = toUserId(nodeId);
    return userId === user.id || permissionError;
  }
);

const isTodoOwner = rule({ cache: "strict" })(
  async (
    _,
    { id }: QueryOrUpdateOrDeleteTodosArgs,
    { logger, user, dataSources: { todoAPI } }: Context
  ) => {
    logger.debug("todo isTodoOwner called");

    let todo;

    try {
      todo = await todoAPI.get(id);
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
  (_, { userId: nodeId }: MutationCreateTodoArgs, { logger, user }: Context) => {
    logger.debug("todo isMine called");
    const userId = toUserId(nodeId);
    return userId === user.id || permissionError;
  }
);

const isSelf = rule({ cache: "strict" })(({ userId }: Parent, _, { logger, user }: Context) => {
  logger.debug("todo isSelf called");
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
  },
  Todo: {
    user: race(isAdmin, isSelf),
  },
};
