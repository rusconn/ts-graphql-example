import { splitUserNodeId } from "@/adapters";
import * as DataSource from "@/datasources";
import { ParseError } from "@/errors";
import { Graph } from "@/graphql/types";
import { parseConnectionArgs, parseTodoNodeId, parseUserNodeId } from "@/graphql/utils";

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

      const beforeToUse = before ? parseUserNodeId(before) : before;
      const afterToUse = after ? parseUserNodeId(after) : after;

      const directionToUse =
        orderBy?.direction === Graph.OrderDirection.Asc
          ? DataSource.UserSortOrder.asc
          : DataSource.UserSortOrder.desc;

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
    user: ({ id }: Graph.QueryUserArgs): DataSource.GetUserParams => {
      return { id: parseUserNodeId(id) };
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

      const idToUse = parseUserNodeId(id);

      if (name === null) {
        throw new ParseError("`name` must be not null");
      }

      if (name && [...name].length > 100) {
        throw new ParseError("`name` must be up to 100 characteres");
      }

      return { id: idToUse, name };
    },
    deleteUser: ({ id }: Graph.MutationDeleteUserArgs): DataSource.DeleteUserParams => {
      return { id: parseUserNodeId(id) };
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

      const beforeToUse = before ? parseTodoNodeId(before) : before;
      const afterToUse = after ? parseTodoNodeId(after) : after;

      const directionToUse =
        orderBy?.direction === Graph.OrderDirection.Asc
          ? DataSource.TodoSortOrder.asc
          : DataSource.TodoSortOrder.desc;

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
