import { ApolloError, UserInputError } from "apollo-server";

import { ErrorCode, Resolvers } from "@/types";
import * as DataSource from "@/datasources";
import { parsers } from "./parsers";

export const resolvers: Resolvers = {
  Query: {
    viewer: (_, __, { dataSources: { userAPI }, user }) => {
      return userAPI.getByDbId({ id: user.id });
    },
    users: async (_, args, { dataSources: { userAPI } }, info) => {
      const parsed = parsers.Query.users(args);

      try {
        return await userAPI.gets({ ...parsed, info });
      } catch (e) {
        if (e instanceof DataSource.ValidationError) {
          throw new UserInputError(e.message, { thrown: e });
        }

        throw e;
      }
    },
    user: async (_, args, { dataSources: { userAPI } }) => {
      const parsed = parsers.Query.user(args);

      try {
        return await userAPI.get(parsed);
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          throw new ApolloError("Not found", ErrorCode.NotFound, { thrown: e });
        }

        throw e;
      }
    },
  },
  Mutation: {
    createUser: (_, args, { dataSources: { userAPI } }) => {
      const parsed = parsers.Mutation.createUser(args);

      return userAPI.create(parsed);
    },
    updateUser: async (_, args, { dataSources: { userAPI } }) => {
      const parsed = parsers.Mutation.updateUser(args);

      try {
        return await userAPI.update(parsed);
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          throw new ApolloError("Not found", ErrorCode.NotFound, { thrown: e });
        }

        throw e;
      }
    },
    deleteUser: async (_, args, { dataSources: { userAPI } }) => {
      const parsed = parsers.Mutation.deleteUser(args);

      try {
        return await userAPI.delete(parsed);
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
      const parsed = parsers.User.todos(args);

      try {
        return await todoAPI.getsUserTodos({ nodeId: id, ...parsed, info });
      } catch (e) {
        if (e instanceof DataSource.ValidationError) {
          throw new UserInputError(e.message, { thrown: e });
        }

        throw e;
      }
    },
  },
};
