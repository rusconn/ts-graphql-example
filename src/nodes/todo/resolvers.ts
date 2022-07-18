import { ApolloError, UserInputError } from "apollo-server";

import { ErrorCode, Resolvers, TodoStatus } from "@/types";
import * as DataSource from "@/datasources";

export const resolvers: Resolvers = {
  Query: {
    todos: async (_, args, { dataSources: { todoAPI } }, info) => {
      try {
        return await todoAPI.getsUserTodos({ nodeId: args.userId, ...args, info });
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
    todo: async (_, { id }, { dataSources: { todoAPI } }) => {
      try {
        return await todoAPI.get({ nodeId: id });
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
      return todoAPI.create({ nodeId: args.userId, ...args.input });
    },
    updateTodo: async (_, { id, input }, { dataSources: { todoAPI } }) => {
      try {
        return await todoAPI.update({ nodeId: id, ...input });
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          throw new ApolloError("Not found", ErrorCode.NotFound, { thrown: e });
        }

        throw e;
      }
    },
    deleteTodo: async (_, { id }, { dataSources: { todoAPI } }) => {
      try {
        return await todoAPI.delete({ nodeId: id });
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          throw new ApolloError("Not found", ErrorCode.NotFound, { thrown: e });
        }

        throw e;
      }
    },
    completeTodo: async (_, { id }, { dataSources: { todoAPI } }) => {
      try {
        return await todoAPI.update({ nodeId: id, status: TodoStatus.Done });
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          throw new ApolloError("Not found", ErrorCode.NotFound, { thrown: e });
        }

        throw e;
      }
    },
    uncompleteTodo: async (_, { id }, { dataSources: { todoAPI } }) => {
      try {
        return await todoAPI.update({ nodeId: id, status: TodoStatus.Pending });
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
