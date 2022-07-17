import { ApolloError, UserInputError } from "apollo-server";

import { ErrorCode, Resolvers, TodoStatus } from "@/types";
import * as DataSource from "@/datasources";
import { validations } from "./validations";

export const resolvers: Resolvers = {
  Query: {
    todos: async (_, args, { dataSources: { todoAPI } }, info) => {
      validations.Query.todos(args);

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
    todo: async (_, args, { dataSources: { todoAPI } }) => {
      validations.Query.todo(args);

      try {
        return await todoAPI.get({ nodeId: args.id });
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
      validations.Mutation.createTodo(args);

      return todoAPI.create({ nodeId: args.userId, ...args.input });
    },
    updateTodo: async (_, args, { dataSources: { todoAPI } }) => {
      validations.Mutation.updateTodo(args);

      try {
        return await todoAPI.update({ nodeId: args.id, ...args.input });
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          throw new ApolloError("Not found", ErrorCode.NotFound, { thrown: e });
        }

        throw e;
      }
    },
    deleteTodo: async (_, args, { dataSources: { todoAPI } }) => {
      validations.Mutation.deleteTodo(args);

      try {
        return await todoAPI.delete({ nodeId: args.id });
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          throw new ApolloError("Not found", ErrorCode.NotFound, { thrown: e });
        }

        throw e;
      }
    },
    completeTodo: async (_, args, { dataSources: { todoAPI } }) => {
      validations.Mutation.completeTodo(args);

      try {
        return await todoAPI.update({ nodeId: args.id, status: TodoStatus.Done });
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          throw new ApolloError("Not found", ErrorCode.NotFound, { thrown: e });
        }

        throw e;
      }
    },
    uncompleteTodo: async (_, args, { dataSources: { todoAPI } }) => {
      validations.Mutation.uncompleteTodo(args);

      try {
        return await todoAPI.update({ nodeId: args.id, status: TodoStatus.Pending });
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
