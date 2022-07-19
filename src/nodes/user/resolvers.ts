import { ApolloError } from "apollo-server";

import { ErrorCode, Resolvers } from "@/types";
import * as DataSource from "@/datasources";
import { parsers } from "./parsers";

export const resolvers: Resolvers = {
  Query: {
    viewer: (_, __, { dataSources: { userAPI }, user }) => {
      return userAPI.getByDbId({ id: user.id });
    },
    users: (_, args, { dataSources: { userAPI } }, info) => {
      const parsed = parsers.Query.users(args);

      return userAPI.gets({ ...parsed, info });
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
    todos: ({ id }, args, { dataSources: { todoAPI } }, info) => {
      const parsed = parsers.User.todos(args);

      return todoAPI.getsUserTodos({ nodeId: id, ...parsed, info });
    },
  },
};
