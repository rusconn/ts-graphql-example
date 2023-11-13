import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";

import * as Prisma from "@/prisma/mod.js";
import { isAdmin } from "../common/authorizers.js";
import { parseConnectionArgs, ParseError } from "../common/parsers.js";
import { full } from "../common/resolvers.js";
import {
  QueryResolvers,
  QueryUsersArgs,
  OrderDirection,
  UserOrderField,
} from "../common/schema.js";
import { cursorConnections, orderOptions } from "../common/typeDefs.js";

export const typeDef = /* GraphQL */ `
  extend type Query {
    users(
      "max: 30"
      first: Int
      after: String
      "max: 30"
      last: Int
      before: String
      orderBy: UserOrder! = { field: CREATED_AT, direction: DESC }
    ): UserConnection
  }

  ${orderOptions("User")}
  ${cursorConnections("User", { totalCount: "Int!" })}
`;

export const resolver: QueryResolvers["users"] = (_parent, args, context, resolveInfo) => {
  authorizer(context.user);

  const { orderBy, first, last, before, after } = parser(args);

  return findManyCursorConnection(
    findManyArgs =>
      context.prisma.user
        .findMany({
          ...findManyArgs,
          orderBy,
        })
        .then(users => users.map(full)),
    () => context.prisma.user.count(),
    { first, last, before, after },
    { resolveInfo }
  );
};

export const authorizer = isAdmin;

export const parser = (args: QueryUsersArgs) => {
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
    orderBy.direction === OrderDirection.Asc
      ? Prisma.Prisma.SortOrder.asc
      : Prisma.Prisma.SortOrder.desc;

  const orderByToUse =
    orderBy.field === UserOrderField.UpdatedAt
      ? [{ updatedAt: directionToUse }, { id: directionToUse }]
      : [{ createdAt: directionToUse }, { id: directionToUse }];

  return { first: firstToUse, last, before, after, orderBy: orderByToUse };
};
