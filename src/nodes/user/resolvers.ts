import { UserInputError } from "apollo-server";

import type { Resolvers } from "@/types";
import * as DataSource from "@/datasources";

export const resolvers: Resolvers = {
  Query: {
    users: async (_, args, { dataSources: { userAPI } }) => {
      try {
        return await userAPI.gets(args);
      } catch (e) {
        if (e instanceof DataSource.ValidationError) {
          throw new UserInputError(e.message, { thrown: e });
        }

        throw e;
      }
    },
    user: (_, { id }, { dataSources: { userAPI } }) => {
      return userAPI.get(id);
    },
  },
  Mutation: {
    createUser: (_, { input }, { dataSources: { userAPI } }) => {
      return userAPI.create(input);
    },
    updateUser: async (_, { id, input }, { dataSources: { userAPI } }) => {
      try {
        return await userAPI.update(id, input);
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          throw new UserInputError("Not found", { thrown: e });
        }

        throw e;
      }
    },
    deleteUser: async (_, { id }, { dataSources: { userAPI } }) => {
      try {
        return await userAPI.delete(id);
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          throw new UserInputError("Not found", { thrown: e });
        }

        throw e;
      }
    },
  },
  User: {
    todos: ({ id }, args, { dataSources: { todoAPI } }) => {
      return todoAPI.getsUserTodos(id, args);
    },
  },
};
