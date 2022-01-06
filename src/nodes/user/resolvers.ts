import { UserInputError } from "apollo-server";

import type { Resolvers } from "@/types";
import { NotFoundError } from "@/datasources";
import { BaseError } from "@/errors";

export const resolvers: Resolvers = {
  Query: {
    users: (_, { option }, { dataSources: { userAPI } }) => {
      return userAPI.gets(option);
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
        if (e instanceof NotFoundError) {
          throw new UserInputError("Not found", { thrown: e });
        }

        throw e;
      }
    },
    deleteUser: async (_, { id }, { dataSources: { userAPI } }) => {
      try {
        return await userAPI.delete(id);
      } catch (e) {
        if (e instanceof NotFoundError) {
          throw new UserInputError("Not found", { thrown: e });
        }

        throw e;
      }
    },
  },
  User: {
    todos: async ({ id }, { option }, { dataSources: { todoAPI } }) => {
      const todosResult = await todoAPI.getsByUserId(id, option);

      if (!todosResult) {
        throw new BaseError(`User.todos failed: parent.id": ${id}`);
      }

      return todosResult;
    },
  },
};
