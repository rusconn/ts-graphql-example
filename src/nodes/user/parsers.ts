import { UserInputError } from "apollo-server";

import type {
  MutationCreateUserArgs,
  MutationDeleteUserArgs,
  MutationUpdateUserArgs,
  QueryUserArgs,
  QueryUsersArgs,
  UserTodosArgs,
} from "@/types";
import { assertIsTodoNodeId, assertIsUserNodeId, parseConnectionArgs } from "@/utils";

export const parsers = {
  Query: {
    users: (args: QueryUsersArgs) => {
      const { orderBy, ...connectionArgs } = args;

      const { first, last, before, after } = parseConnectionArgs(connectionArgs);

      if (first && first > 30) {
        throw new UserInputError("`first` must be up to 30");
      }

      if (last && last > 30) {
        throw new UserInputError("`last` must be up to 30");
      }

      if (before) {
        try {
          assertIsUserNodeId(before);
        } catch (e) {
          throw new UserInputError("invalid `before`", { thrown: e });
        }
      }

      if (after) {
        try {
          assertIsUserNodeId(after);
        } catch (e) {
          throw new UserInputError("invalid `after`", { thrown: e });
        }
      }

      return { first, last, before, after, orderBy };
    },
    user: (args: QueryUserArgs) => {
      const { id } = args;

      try {
        assertIsUserNodeId(id);
      } catch (e) {
        throw new UserInputError("invalid `id`", { thrown: e });
      }

      return { nodeId: id };
    },
  },
  Mutation: {
    createUser: (args: MutationCreateUserArgs) => {
      const { name } = args.input;

      if ([...name].length > 100) {
        throw new UserInputError("`name` must be up to 100 characteres");
      }

      return { name };
    },
    updateUser: (args: MutationUpdateUserArgs) => {
      const {
        id,
        input: { name },
      } = args;

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

      return { nodeId: id, name };
    },
    deleteUser: (args: MutationDeleteUserArgs) => {
      const { id } = args;

      try {
        assertIsUserNodeId(id);
      } catch (e) {
        throw new UserInputError("invalid `userId`", { thrown: e });
      }

      return { nodeId: id };
    },
  },
  User: {
    todos: (args: UserTodosArgs) => {
      const { orderBy, ...connectionArgs } = args;

      const { first, last, before, after } = parseConnectionArgs(connectionArgs);

      if (first && first > 50) {
        throw new UserInputError("`first` must be up to 50");
      }

      if (last && last > 50) {
        throw new UserInputError("`last` must be up to 50");
      }

      if (before) {
        try {
          assertIsTodoNodeId(before);
        } catch (e) {
          throw new UserInputError("invalid `before`", { thrown: e });
        }
      }

      if (after) {
        try {
          assertIsTodoNodeId(after);
        } catch (e) {
          throw new UserInputError("invalid `after`", { thrown: e });
        }
      }

      return { first, last, before, after, orderBy };
    },
  },
};
