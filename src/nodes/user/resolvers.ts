import { ApolloError, UserInputError } from "apollo-server";

import { ErrorCode, Resolvers } from "@/types";
import * as DataSource from "@/datasources";

export const resolvers: Resolvers = {
  Query: {
    viewer: (_, __, { dataSources: { userAPI }, user }) => {
      return userAPI.getByDbId({ id: user.id });
    },
    users: async (_, args, { dataSources: { userAPI } }, info) => {
      try {
        return await userAPI.gets({ ...args, info });
      } catch (e) {
        if (e instanceof DataSource.ValidationError) {
          throw new UserInputError(e.message, { thrown: e });
        }

        throw e;
      }
    },
    user: async (_, { id }, { dataSources: { userAPI } }) => {
      try {
        return await userAPI.get({ nodeId: id });
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          throw new ApolloError("Not found", ErrorCode.NotFound, { thrown: e });
        }

        throw e;
      }
    },
  },
  Mutation: {
    createUser: (_, { input }, { dataSources: { userAPI } }) => {
      return userAPI.create(input);
    },
    updateUser: async (_, { id, input }, { dataSources: { userAPI } }) => {
      try {
        return await userAPI.update({ nodeId: id, ...input });
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          throw new ApolloError("Not found", ErrorCode.NotFound, { thrown: e });
        }

        throw e;
      }
    },
    deleteUser: async (_, { id }, { dataSources: { userAPI } }) => {
      try {
        return await userAPI.delete({ nodeId: id });
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          throw new ApolloError("Not found", ErrorCode.NotFound, { thrown: e });
        }

        throw e;
      }
    },
  },
  User: {
    todos: async ({ id }, args, { dataSources: { todoAPI } }, info) => {
      try {
        return await todoAPI.getsUserTodos({ nodeId: id, ...args, info });
      } catch (e) {
        if (e instanceof DataSource.ValidationError) {
          throw new UserInputError(e.message, { thrown: e });
        }

        throw e;
      }
    },
  },
};
