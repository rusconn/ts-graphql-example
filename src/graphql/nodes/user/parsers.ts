import { Prisma } from "@prisma/client";

import { splitTodoNodeId, splitUserNodeId } from "@/adapters";
import type * as DataSource from "@/datasources";
import { ParseError } from "@/errors";
import { Graph } from "@/graphql/types";
import { parseConnectionArgs } from "@/graphql/utils";

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

      const firstToUse = first == null && last == null ? 10 : first;

      let beforeToUse = before;
      let afterToUse = after;

      try {
        if (before) {
          ({ id: beforeToUse } = splitUserNodeId(before));
        }

        if (after) {
          ({ id: afterToUse } = splitUserNodeId(after));
        }
      } catch (e) {
        if (e instanceof Error) {
          throw new ParseError(e.message, e);
        }

        throw e;
      }

      const directionToUse =
        orderBy?.direction === Graph.OrderDirection.Asc
          ? Prisma.SortOrder.asc
          : Prisma.SortOrder.desc;

      const orderByToUse =
        orderBy?.field === Graph.UserOrderField.UpdatedAt
          ? [{ updatedAt: directionToUse }, { id: directionToUse }]
          : [{ createdAt: directionToUse }, { id: directionToUse }];

      return {
        first: firstToUse,
        last,
        before: beforeToUse,
        after: afterToUse,
        orderBy: orderByToUse,
      };
    },
    user: (args: Graph.QueryUserArgs): DataSource.GetUserParams => {
      const { id } = args;

      try {
        return splitUserNodeId(id);
      } catch (e) {
        if (e instanceof Error) {
          throw new ParseError(e.message, e);
        }

        throw e;
      }
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

      let idToUse;

      try {
        ({ id: idToUse } = splitUserNodeId(id));
      } catch (e) {
        if (e instanceof Error) {
          throw new ParseError(e.message, e);
        }

        throw e;
      }

      if (name === null) {
        throw new ParseError("`name` must be not null");
      }

      if (name && [...name].length > 100) {
        throw new ParseError("`name` must be up to 100 characteres");
      }

      return { id: idToUse, name };
    },
    deleteUser: (args: Graph.MutationDeleteUserArgs): DataSource.DeleteUserParams => {
      const { id } = args;

      try {
        return splitUserNodeId(id);
      } catch (e) {
        if (e instanceof Error) {
          throw new ParseError(e.message, e);
        }

        throw e;
      }
    },
  },
  User: {
    todos: (
      args: Graph.UserTodosArgs & Pick<Graph.User, "id">
    ): Omit<DataSource.GetUserTodosParams, "info"> => {
      const { id, orderBy, ...connectionArgs } = args;

      const { id: userId } = splitUserNodeId(id);

      const { first, last, before, after } = parseConnectionArgs(connectionArgs);

      if (first && first > 50) {
        throw new ParseError("`first` must be up to 50");
      }

      if (last && last > 50) {
        throw new ParseError("`last` must be up to 50");
      }

      const firstToUse = first == null && last == null ? 20 : first;

      let beforeToUse = before;
      let afterToUse = after;

      try {
        if (before) {
          ({ id: beforeToUse } = splitTodoNodeId(before));
        }

        if (after) {
          ({ id: afterToUse } = splitTodoNodeId(after));
        }
      } catch (e) {
        if (e instanceof Error) {
          throw new ParseError(e.message, e);
        }

        throw e;
      }

      const directionToUse =
        orderBy?.direction === Graph.OrderDirection.Asc
          ? Prisma.SortOrder.asc
          : Prisma.SortOrder.desc;

      const orderByToUse =
        orderBy?.field === Graph.TodoOrderField.CreatedAt
          ? [{ createdAt: directionToUse }, { id: directionToUse }]
          : [{ updatedAt: directionToUse }, { id: directionToUse }];

      return {
        first: firstToUse,
        last,
        before: beforeToUse,
        after: afterToUse,
        userId,
        orderBy: orderByToUse,
      };
    },
  },
};
