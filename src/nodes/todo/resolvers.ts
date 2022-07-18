import { ApolloError, UserInputError } from "apollo-server";

import { ErrorCode, Resolvers, TodoStatus } from "@/types";
import * as DataSource from "@/datasources";
import { parsers } from "./parsers";

export const resolvers: Resolvers = {
  Query: {
    todos: async (_, args, { dataSources: { todoAPI } }, info) => {
      const parsed = parsers.Query.todos(args);

      try {
        return await todoAPI.getsUserTodos({ ...parsed, info });
      } catch (e) {
        if (e instanceof DataSource.ValidationError) {
          throw new UserInputError(e.message, { thrown: e });
        }

        if (e instanceof DataSource.NotFoundError) {
          throw new ApolloError("Not found", ErrorCode.NotFound, { thrown: e });
        }

        throw e;
      }
    },
    todo: async (_, args, { dataSources: { todoAPI } }) => {
      const parsed = parsers.Query.todo(args);

      try {
        return await todoAPI.get(parsed);
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          throw new ApolloError("Not found", ErrorCode.NotFound, { thrown: e });
        }

        throw e;
      }
    },
  },
  Mutation: {
    createTodo: (_, args, { dataSources: { todoAPI } }) => {
      const parsed = parsers.Mutation.createTodo(args);

      return todoAPI.create(parsed);
    },
    updateTodo: async (_, args, { dataSources: { todoAPI } }) => {
      const parsed = parsers.Mutation.updateTodo(args);

      try {
        return await todoAPI.update(parsed);
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          throw new ApolloError("Not found", ErrorCode.NotFound, { thrown: e });
        }

        throw e;
      }
    },
    deleteTodo: async (_, args, { dataSources: { todoAPI } }) => {
      const parsed = parsers.Mutation.deleteTodo(args);

      try {
        return await todoAPI.delete(parsed);
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          throw new ApolloError("Not found", ErrorCode.NotFound, { thrown: e });
        }

        throw e;
      }
    },
    completeTodo: async (_, args, { dataSources: { todoAPI } }) => {
      const parsed = parsers.Mutation.completeTodo(args);

      try {
        return await todoAPI.update({ ...parsed, status: TodoStatus.Done });
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          throw new ApolloError("Not found", ErrorCode.NotFound, { thrown: e });
        }

        throw e;
      }
    },
    uncompleteTodo: async (_, args, { dataSources: { todoAPI } }) => {
      const parsed = parsers.Mutation.uncompleteTodo(args);

      try {
        return await todoAPI.update({ ...parsed, status: TodoStatus.Pending });
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          throw new ApolloError("Not found", ErrorCode.NotFound, { thrown: e });
        }

        throw e;
      }
    },
  },
  Todo: {
    user: async ({ userId }, _, { dataSources: { userAPI } }) => {
      try {
        return await userAPI.getByDbId({ id: userId });
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          throw new ApolloError("Not found", ErrorCode.NotFound, { thrown: e });
        }

        throw e;
      }
    },
  },
};
