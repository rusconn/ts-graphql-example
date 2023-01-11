import type * as DataSource from "@/datasources";
import { ParseError } from "@/errors";
import { Graph } from "@/graphql/types";
import { parseConnectionArgs } from "@/graphql/utils";
import { isTodoId, isUserId } from "@/ids";

export const parsers = {
  Query: {
    users: (args: Graph.QueryUsersArgs): Omit<DataSource.GetUsersParams, "info"> => {
      const { orderBy, ...connectionArgs } = args;

      const { first, last, before, after } = parseConnectionArgs(connectionArgs);

      if (first && first > 30) {
        throw new ParseError("`first` must be up to 30");
      }

      if (last && last > 30) {
        throw new ParseError("`last` must be up to 30");
      }

      if (before && !isUserId(before)) {
        throw new ParseError("invalid `before`");
      }

      if (after && !isUserId(after)) {
        throw new ParseError("invalid `after`");
      }

      const defaultedConnectionArgs =
        first == null && last == null
          ? { first: 10, last, before, after }
          : { first, last, before, after };

      const directionToUse = orderBy?.direction === Graph.OrderDirection.Asc ? "asc" : "desc";

      const orderByToUse =
        orderBy?.field === Graph.UserOrderField.UpdatedAt
          ? [{ updatedAt: directionToUse } as const, { id: directionToUse } as const]
          : [{ createdAt: directionToUse } as const, { id: directionToUse } as const];

      return { ...defaultedConnectionArgs, orderBy: orderByToUse };
    },
    user: (args: Graph.QueryUserArgs): DataSource.GetUserParams => {
      const { id } = args;

      if (!isUserId(id)) {
        throw new ParseError("invalid `id`");
      }

      return { id };
    },
  },
  Mutation: {
    createUser: (args: Graph.MutationCreateUserArgs): DataSource.CreateUserParams => {
      const { name } = args.input;

      if ([...name].length > 100) {
        throw new ParseError("`name` must be up to 100 characteres");
      }

      return { name };
    },
    updateUser: (args: Graph.MutationUpdateUserArgs): DataSource.UpdateUserParams => {
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

      if (!isUserId(id)) {
        throw new ParseError("invalid `id`");
      }

      return { id, name };
    },
    deleteUser: (args: Graph.MutationDeleteUserArgs): DataSource.DeleteUserParams => {
      const { id } = args;

      if (!isUserId(id)) {
        throw new ParseError("invalid `id`");
      }

      return { id };
    },
  },
  User: {
    todos: (args: Graph.UserTodosArgs): Omit<DataSource.GetUserTodosParams, "userId" | "info"> => {
      const { orderBy, ...connectionArgs } = args;

      const { first, last, before, after } = parseConnectionArgs(connectionArgs);

      if (first && first > 50) {
        throw new ParseError("`first` must be up to 50");
      }

      if (last && last > 50) {
        throw new ParseError("`last` must be up to 50");
      }

      if (before && !isTodoId(before)) {
        throw new ParseError("invalid `before`");
      }

      if (after && !isTodoId(after)) {
        throw new ParseError("invalid `after`");
      }

      const defaultedConnectionArgs =
        first == null && last == null
          ? { first: 20, last, before, after }
          : { first, last, before, after };

      const directionToUse = orderBy?.direction === Graph.OrderDirection.Asc ? "asc" : "desc";

      const orderByToUse =
        orderBy?.field === Graph.TodoOrderField.CreatedAt
          ? [{ createdAt: directionToUse } as const, { id: directionToUse } as const]
          : [{ updatedAt: directionToUse } as const, { id: directionToUse } as const];

      return { ...defaultedConnectionArgs, orderBy: orderByToUse };
    },
  },
};
