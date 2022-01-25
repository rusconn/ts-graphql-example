import { ApolloError, UserInputError } from "apollo-server";

import { ErrorCode, Resolvers } from "@/types";
import * as DataSource from "@/datasources";

export const resolvers: Resolvers = {
  Query: {
    todos: async (_, args, { dataSources: { todoAPI } }) => {
      try {
        return await todoAPI.getsByUserId(args);
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
        return await todoAPI.get(id);
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          throw new ApolloError("Not found", ErrorCode.NotFound, { thrown: e });
        }

        throw e;
      }
    },
  },
  Mutation: {
    createTodo: (_, { userId, input }, { dataSources: { todoAPI } }) => {
      return todoAPI.create(userId, input);
    },
    updateTodo: async (_, { id, input }, { dataSources: { todoAPI } }) => {
      try {
        return await todoAPI.update(id, input);
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          throw new ApolloError("Not found", ErrorCode.NotFound, { thrown: e });
        }

        throw e;
      }
    },
    deleteTodo: async (_, { id }, { dataSources: { todoAPI } }) => {
      try {
        return await todoAPI.delete(id);
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
        return await userAPI.getByDbId(userId);
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          throw new ApolloError("Not found", ErrorCode.NotFound, { thrown: e });
        }

        throw e;
      }
    },
  },
};
