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
    users: (args: QueryUsersArgs) => {
      const { first, last } = args;

      if (first && first > 30) {
        throw new UserInputError("`first` must be up to 30");
      }

      if (last && last > 30) {
        throw new UserInputError("`last` must be up to 30");
      }
    },
    user: (args: QueryUserArgs) => {
      try {
        assertIsUserNodeId(args.id);
      } catch (e) {
        throw new UserInputError("invalid `id`", { thrown: e });
      }
    },
  },
  Mutation: {
    createUser: (args: MutationCreateUserArgs) => {
      if ([...args.input.name].length > 100) {
        throw new UserInputError("`name` must be up to 100 characteres");
      }
    },
    updateUser: (args: MutationUpdateUserArgs) => {
      const { name } = args.input;

      if (name === null) {
        throw new UserInputError("`name` must be not null");
      }

      if (name && [...name].length > 100) {
        throw new UserInputError("`name` must be up to 100 characteres");
      }

      try {
        assertIsUserNodeId(args.id);
      } catch (e) {
        throw new UserInputError("invalid `userId`", { thrown: e });
      }
    },
    deleteUser: (args: MutationDeleteUserArgs) => {
      try {
        assertIsUserNodeId(args.id);
      } catch (e) {
        throw new UserInputError("invalid `userId`", { thrown: e });
      }
    },
  },
  User: {
    todos: (args: UserTodosArgs) => {
      const { first, last } = args;

      if (first && first > 50) {
        throw new UserInputError("`first` must be up to 50");
      }

      if (last && last > 50) {
        throw new UserInputError("`last` must be up to 50");
      }
    },
  },
};
