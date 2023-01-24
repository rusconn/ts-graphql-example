import * as DataSource from "@/datasources";
import { splitUserNodeId } from "@/graphql/adapters";
import { ParseError } from "@/graphql/errors";
import { Graph } from "@/graphql/types";
import { parseConnectionArgs, parseTodoNodeId, parseUserNodeId } from "@/graphql/utils";

export const parsers = {
  Query: {
    users: (args: Graph.QueryUsersArgs) => {
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
        orderBy.direction === Graph.OrderDirection.Asc
          ? DataSource.UserSortOrder.asc
          : DataSource.UserSortOrder.desc;

      const orderByToUse =
        orderBy.field === Graph.UserOrderField.UpdatedAt
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
    user: ({ id }: Graph.QueryUserArgs) => {
      return { id: parseUserNodeId(id) };
    },
  },
  Mutation: {
    signup: (args: Graph.MutationSignupArgs) => {
      const { name, email, password } = args.input;

      if ([...name].length > 100) {
        throw new ParseError("`name` must be up to 100 characteres");
      }

      if ([...email].length > 100) {
        throw new ParseError("`email` must be up to 100 characteres");
      }

      if ([...password].length < 8) {
        throw new ParseError("`password` must be at least 8 characteres");
      }

      if ([...password].length > 50) {
        throw new ParseError("`password` must be up to 50 characteres");
      }

      return { name, email, password, role: DataSource.Role.USER };
    },
    login: (args: Graph.MutationLoginArgs) => {
      const { email, password } = args.input;

      if ([...email].length > 100) {
        throw new ParseError("`email` must be up to 100 characteres");
      }

      if ([...password].length < 8) {
        throw new ParseError("`password` must be at least 8 characteres");
      }

      if ([...password].length > 50) {
        throw new ParseError("`password` must be up to 50 characteres");
      }

      return { email, password };
    },
    updateMe: (args: Graph.MutationUpdateMeArgs) => {
      const {
        input: { name, email, password },
      } = args;

      if (name === null) {
        throw new ParseError("`name` must be not null");
      }

      if (name && [...name].length > 100) {
        throw new ParseError("`name` must be up to 100 characteres");
      }

      if (email === null) {
        throw new ParseError("`email` must be not null");
      }

      if (email && [...email].length > 100) {
        throw new ParseError("`email` must be up to 100 characteres");
      }

      if (password === null) {
        throw new ParseError("`password` must be not null");
      }

      if (password && [...password].length < 8) {
        throw new ParseError("`password` must be at least 8 characteres");
      }

      if (password && [...password].length > 50) {
        throw new ParseError("`password` must be up to 50 characteres");
      }

      return { name, email, password };
    },
  },
  User: {
    todos: (args: Graph.UserTodosArgs & Pick<Graph.User, "id">) => {
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
        orderBy.direction === Graph.OrderDirection.Asc
          ? DataSource.TodoSortOrder.asc
          : DataSource.TodoSortOrder.desc;

      const orderByToUse =
        orderBy.field === Graph.TodoOrderField.CreatedAt
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
