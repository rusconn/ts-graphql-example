import type {
  CreateUserParams,
  DeleteUserParams,
  GetUserParams,
  GetUsersParams,
  GetUserTodosParams,
  UpdateUserParams,
} from "@/datasources";
import { ParseError } from "@/errors";
import {
  MutationCreateUserArgs,
  MutationDeleteUserArgs,
  MutationUpdateUserArgs,
  OrderDirection,
  QueryUserArgs,
  QueryUsersArgs,
  TodoOrderField,
  UserOrderField,
  UserTodosArgs,
} from "@/types";
import { assertIsTodoNodeId, assertIsUserNodeId, parseConnectionArgs } from "@/utils";

export const parsers = {
  Query: {
    users: (args: QueryUsersArgs): Omit<GetUsersParams, "info"> => {
      const { orderBy, ...connectionArgs } = args;

      const { first, last, before, after } = parseConnectionArgs(connectionArgs);

      if (first && first > 30) {
        throw new ParseError("`first` must be up to 30");
      }

      if (last && last > 30) {
        throw new ParseError("`last` must be up to 30");
      }

      if (before) {
        try {
          assertIsUserNodeId(before);
        } catch (e) {
          if (e instanceof Error) {
            throw new ParseError("invalid `before`", e);
          }

          throw e;
        }
      }

      if (after) {
        try {
          assertIsUserNodeId(after);
        } catch (e) {
          if (e instanceof Error) {
            throw new ParseError("invalid `after`", e);
          }

          throw e;
        }
      }

      const defaultedConnectionArgs =
        first == null && last == null
          ? { first: 10, last, before, after }
          : { first, last, before, after };

      const directionToUse = orderBy?.direction === OrderDirection.Asc ? "asc" : "desc";

      const orderByToUse =
        orderBy?.field === UserOrderField.UpdatedAt
          ? [{ updatedAt: directionToUse } as const, { id: directionToUse } as const]
          : ({ id: directionToUse } as const);

      return { ...defaultedConnectionArgs, orderBy: orderByToUse };
    },
    user: (args: QueryUserArgs): GetUserParams => {
      const { id } = args;

      try {
        assertIsUserNodeId(id);
      } catch (e) {
        if (e instanceof Error) {
          throw new ParseError("invalid `id`", e);
        }

        throw e;
      }

      return { nodeId: id };
    },
  },
  Mutation: {
    createUser: (args: MutationCreateUserArgs): CreateUserParams => {
      const { name } = args.input;

      if ([...name].length > 100) {
        throw new ParseError("`name` must be up to 100 characteres");
      }

      return { name };
    },
    updateUser: (args: MutationUpdateUserArgs): UpdateUserParams => {
      const {
        id,
        input: { name },
      } = args;

      if (name === null) {
        throw new ParseError("`name` must be not null");
      }

      if (name && [...name].length > 100) {
        throw new ParseError("`name` must be up to 100 characteres");
      }

      try {
        assertIsUserNodeId(args.id);
      } catch (e) {
        if (e instanceof Error) {
          throw new ParseError("invalid `userId`", e);
        }

        throw e;
      }

      return { nodeId: id, name };
    },
    deleteUser: (args: MutationDeleteUserArgs): DeleteUserParams => {
      const { id } = args;

      try {
        assertIsUserNodeId(id);
      } catch (e) {
        if (e instanceof Error) {
          throw new ParseError("invalid `userId`", e);
        }

        throw e;
      }

      return { nodeId: id };
    },
  },
  User: {
    todos: (args: UserTodosArgs): Omit<GetUserTodosParams, "nodeId" | "info"> => {
      const { orderBy, ...connectionArgs } = args;

      const { first, last, before, after } = parseConnectionArgs(connectionArgs);

      if (first && first > 50) {
        throw new ParseError("`first` must be up to 50");
      }

      if (last && last > 50) {
        throw new ParseError("`last` must be up to 50");
      }

      if (before) {
        try {
          assertIsTodoNodeId(before);
        } catch (e) {
          if (e instanceof Error) {
            throw new ParseError("invalid `before`", e);
          }

          throw e;
        }
      }

      if (after) {
        try {
          assertIsTodoNodeId(after);
        } catch (e) {
          if (e instanceof Error) {
            throw new ParseError("invalid `after`", e);
          }

          throw e;
        }
      }

      const defaultedConnectionArgs =
        first == null && last == null
          ? { first: 20, last, before, after }
          : { first, last, before, after };

      const directionToUse = orderBy?.direction === OrderDirection.Asc ? "asc" : "desc";

      const orderByToUse =
        orderBy?.field === TodoOrderField.CreatedAt
          ? ({ id: directionToUse } as const)
          : [{ updatedAt: directionToUse } as const, { id: directionToUse } as const];

      return { ...defaultedConnectionArgs, orderBy: orderByToUse };
    },
  },
};
