import * as Prisma from "@/prisma";
import * as Graph from "../common/schema";
import { parseConnectionArgs, ParseError, parseSomeNodeId } from "../common/parsers";
import { nodeType } from "./typeDefs";

export const parseUserNodeId = parseSomeNodeId(nodeType);

export const parsers = {
  Query: {
    users: (args: Graph.QueryUsersArgs) => {
      const { orderBy, ...connectionArgs } = args;

      const { first, last, before, after } = parseConnectionArgs(connectionArgs);

      if (first == null && last == null) {
        throw new ParseError("`first` or `last` value required");
      }
      if (first && first > 30) {
        throw new ParseError("`first` must be up to 30");
      }
      if (last && last > 30) {
        throw new ParseError("`last` must be up to 30");
      }

      const firstToUse = first == null && last == null ? 10 : first;

      const directionToUse =
        orderBy.direction === Graph.OrderDirection.Asc
          ? Prisma.Prisma.SortOrder.asc
          : Prisma.Prisma.SortOrder.desc;

      const orderByToUse =
        orderBy.field === Graph.UserOrderField.UpdatedAt
          ? [{ updatedAt: directionToUse }, { id: directionToUse }]
          : [{ createdAt: directionToUse }, { id: directionToUse }];

      return { first: firstToUse, last, before, after, orderBy: orderByToUse };
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

      return { name, email, password, role: Prisma.Role.USER };
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
      const { name, email, password } = args.input;

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
};
