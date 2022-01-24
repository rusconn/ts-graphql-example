import { UserInputError } from "apollo-server";

import type { Resolvers } from "@/types";
import * as DataSource from "@/datasources";
import { BaseError } from "@/errors";

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
          throw new UserInputError("Not found", { thrown: e });
        }

        throw e;
      }
    },
    todo: (_, { id }, { dataSources: { todoAPI } }) => {
      return todoAPI.get(id);
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
          throw new UserInputError("Not found", { thrown: e });
        }

        throw e;
      }
    },
    deleteTodo: async (_, { id }, { dataSources: { todoAPI } }) => {
      try {
        return await todoAPI.delete(id);
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          throw new UserInputError("Not found", { thrown: e });
        }

        throw e;
      }
    },
  },
  Todo: {
    user: async ({ userId }, _, { dataSources: { userAPI } }) => {
      const user = await userAPI.getByDbId(userId);

      if (!user) {
        throw new BaseError(`Todo.user failed: parent.userId": ${userId}`);
      }

      return user;
    },
  },
};
