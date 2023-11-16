import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";

import * as Prisma from "@/prisma/mod.js";
import { isAdmin } from "../common/authorizers.js";
import { parseConnectionArgs, ParseError } from "../common/parsers.js";
import { full } from "../common/resolvers.js";
import type { QueryResolvers, QueryUsersArgs } from "../common/schema.js";
import { OrderDirection, UserOrderField } from "../common/schema.js";
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

export const resolver: QueryResolvers["users"] = async (_parent, args, context, resolveInfo) => {
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

const authorizer = isAdmin;

const parser = (args: QueryUsersArgs) => {
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

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.js");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.js");
  const { ParseError: ParseErr } = await import("../common/parsers.js");

  describe("Authorization", () => {
    const allow = [admin];

    const deny = [alice, guest];

    test.each(allow)("allow %#", user => {
      expect(() => authorizer(user)).not.toThrow(AuthErr);
    });

    test.each(deny)("deny %#", user => {
      expect(() => authorizer(user)).toThrow(AuthErr);
    });
  });

  describe("Parsing", () => {
    const firstMax = 30;
    const lastMax = 30;

    const valid = [{ first: 10 }, { last: 10 }, { first: firstMax }, { last: lastMax }];

    const invalid = [
      {},
      { first: null },
      { last: null },
      { first: null, last: null },
      { first: firstMax + 1 },
      { last: lastMax + 1 },
    ];

    const orderBy = {
      field: UserOrderField.CreatedAt,
      direction: OrderDirection.Desc,
    };

    test.each(valid)("valid %#", args => {
      expect(() => parser({ ...args, orderBy })).not.toThrow(ParseErr);
    });

    test.each(invalid)("invalid %#", args => {
      expect(() => parser({ ...args, orderBy })).toThrow(ParseErr);
    });
  });
}
