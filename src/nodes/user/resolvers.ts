import { ApolloError, UserInputError } from "apollo-server";

import { ErrorCode, Resolvers } from "@/types";
import * as DataSource from "@/datasources";
import { validations } from "./validations";

export const resolvers: Resolvers = {
  Query: {
    viewer: (_, __, { dataSources: { userAPI }, user }) => {
      return userAPI.getByDbId({ id: user.id });
    },
    users: async (_, args, { dataSources: { userAPI } }, info) => {
      validations.Query.users(args);

      try {
        return await userAPI.gets({ ...args, info });
      } catch (e) {
        if (e instanceof DataSource.ValidationError) {
          throw new UserInputError(e.message, { thrown: e });
        }

        throw e;
      }
    },
    user: async (_, args, { dataSources: { userAPI } }) => {
      validations.Query.user(args);

      try {
        return await userAPI.get({ nodeId: args.id });
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
      validations.Mutation.createUser(args);

      return userAPI.create(args.input);
    },
    updateUser: async (_, args, { dataSources: { userAPI } }) => {
      validations.Mutation.updateUser(args);

      try {
        return await userAPI.update({ nodeId: args.id, ...args.input });
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          throw new ApolloError("Not found", ErrorCode.NotFound, { thrown: e });
        }

        throw e;
      }
    },
    deleteUser: async (_, args, { dataSources: { userAPI } }) => {
      validations.Mutation.deleteUser(args);

      try {
        return await userAPI.delete({ nodeId: args.id });
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
      validations.User.todos(args);

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
