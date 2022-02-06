/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */

import { UserInputError } from "apollo-server";

import type {
  MutationCreateTodoArgs,
  MutationDeleteTodoArgs,
  MutationUpdateTodoArgs,
  QueryTodoArgs,
  QueryTodosArgs,
} from "@/types";
import { assertIsTodoNodeId, assertIsUserNodeId } from "@/utils";

export const validations = {
  Query: {
    todos: (resolve: any, parent: any, args: QueryTodosArgs, context: any, info: any) => {
      const { first, last, userId } = args;

      if (first && first > 50) {
        throw new UserInputError("`first` must be up to 50");
      }

      if (last && last > 50) {
        throw new UserInputError("`last` must be up to 50");
      }

      try {
        assertIsUserNodeId(userId);
      } catch (e) {
        throw new UserInputError("invalid `userId`", { thrown: e });
      }

      return resolve(parent, args, context, info);
    },
    todo: (resolve: any, parent: any, args: QueryTodoArgs, context: any, info: any) => {
      try {
        assertIsTodoNodeId(args.id);
      } catch (e) {
        throw new UserInputError("invalid `id`", { thrown: e });
      }

      return resolve(parent, args, context, info);
    },
  },
  Mutation: {
    createTodo: (
      resolve: any,
      parent: any,
      args: MutationCreateTodoArgs,
      context: any,
      info: any
    ) => {
      const {
        input: { title, description },
      } = args;

      if ([...title].length > 100) {
        throw new UserInputError("`title` must be up to 100 characters");
      }

      if ([...description].length > 5000) {
        throw new UserInputError("`description` must be up to 5000 characters");
      }

      try {
        assertIsUserNodeId(args.userId);
      } catch (e) {
        throw new UserInputError("invalid `userId`", { thrown: e });
      }

      return resolve(parent, args, context, info);
    },
    updateTodo: (
      resolve: any,
      parent: any,
      args: MutationUpdateTodoArgs,
      context: any,
      info: any
    ) => {
      const {
        input: { title, description, status },
      } = args;

      if (title === null) {
        throw new UserInputError("`title` must be not null");
      }

      if (description === null) {
        throw new UserInputError("`description` must be not null");
      }

      if (status === null) {
        throw new UserInputError("`status` must be not null");
      }

      if (title && [...title].length > 100) {
        throw new UserInputError("`title` must be up to 100 characters");
      }

      if (description && [...description].length > 5000) {
        throw new UserInputError("`description` must be up to 5000 characters");
      }

      try {
        assertIsTodoNodeId(args.id);
      } catch (e) {
        throw new UserInputError("invalid `id`", { thrown: e });
      }

      return resolve(parent, args, context, info);
    },
    deleteTodo: (
      resolve: any,
      parent: any,
      args: MutationDeleteTodoArgs,
      context: any,
      info: any
    ) => {
      try {
        assertIsTodoNodeId(args.id);
      } catch (e) {
        throw new UserInputError("invalid `id`", { thrown: e });
      }

      return resolve(parent, args, context, info);
    },
  },
};
