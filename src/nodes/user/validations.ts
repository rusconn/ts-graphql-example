/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */

import { UserInputError } from "apollo-server";

import type {
  MutationCreateUserArgs,
  MutationDeleteUserArgs,
  MutationUpdateUserArgs,
  QueryUserArgs,
  QueryUsersArgs,
  UserTodosArgs,
} from "@/types";
import { assertIsUserNodeId } from "@/utils";

export const validations = {
  Query: {
    users: (resolve: any, parent: any, args: QueryUsersArgs, context: any, info: any) => {
      const { first, last } = args;

      if (first && first > 30) {
        throw new UserInputError("`first` must be up to 30");
      }

      if (last && last > 30) {
        throw new UserInputError("`last` must be up to 30");
      }

      return resolve(parent, args, context, info);
    },
    user: (resolve: any, parent: any, args: QueryUserArgs, context: any, info: any) => {
      try {
        assertIsUserNodeId(args.id);
      } catch (e) {
        throw new UserInputError("invalid `id`", { thrown: e });
      }

      return resolve(parent, args, context, info);
    },
  },
  Mutation: {
    createUser: (
      resolve: any,
      parent: any,
      args: MutationCreateUserArgs,
      context: any,
      info: any
    ) => {
      if ([...args.input.name].length > 100) {
        throw new UserInputError("`name` must be up to 100 characteres");
      }

      return resolve(parent, args, context, info);
    },
    updateUser: (
      resolve: any,
      parent: any,
      args: MutationUpdateUserArgs,
      context: any,
      info: any
    ) => {
      if ([...args.input.name].length > 100) {
        throw new UserInputError("`name` must be up to 100 characteres");
      }

      try {
        assertIsUserNodeId(args.id);
      } catch (e) {
        throw new UserInputError("invalid `userId`", { thrown: e });
      }

      return resolve(parent, args, context, info);
    },
    deleteUser: (
      resolve: any,
      parent: any,
      args: MutationDeleteUserArgs,
      context: any,
      info: any
    ) => {
      try {
        assertIsUserNodeId(args.id);
      } catch (e) {
        throw new UserInputError("invalid `userId`", { thrown: e });
      }

      return resolve(parent, args, context, info);
    },
  },
  User: {
    todos: (resolve: any, parent: any, args: UserTodosArgs, context: any, info: any) => {
      const { first, last } = args;

      if (first && first > 50) {
        throw new UserInputError("`first` must be up to 50");
      }

      if (last && last > 50) {
        throw new UserInputError("`last` must be up to 50");
      }

      return resolve(parent, args, context, info);
    },
  },
};
