import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";

import * as Prisma from "@/prisma/mod.ts";
import { isAdmin } from "../common/authorizers.ts";
import { parseConnectionArgs, ParseError } from "../common/parsers.ts";
import { full } from "../common/resolvers.ts";
import type { QueryResolvers, QueryUsersArgs } from "../common/schema.ts";
import { OrderDirection, UserOrderField } from "../common/schema.ts";
import { cursorConnections, orderOptions } from "../common/typeDefs.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type Query {
    users(
      "max: ${FIRST_MAX}"
      first: Int
      after: String
      "max: ${LAST_MAX}"
      last: Int
      before: String
      orderBy: UserOrder! = { field: CREATED_AT, direction: DESC }
    ): UserConnection
  }

  ${orderOptions("User")}
  ${cursorConnections("User", { totalCount: "Int!" })}
`;

export const resolver: QueryResolvers["users"] = async (_parent, args, context, info) => {
  authorizer(context.user);

  const { first, after, last, before, orderBy } = parser(args);

  return findManyCursorConnection(
    findManyArgs =>
      context.prisma.user
        .findMany({
          ...findManyArgs,
          orderBy,
        })
        .then(users => users.map(full)),
    () => context.prisma.user.count(),
    { first, after, last, before },
    { resolveInfo: info }
  );
};

const authorizer = isAdmin;

const parser = (args: QueryUsersArgs) => {
  const { orderBy, ...connectionArgs } = args;

  const { first, after, last, before } = parseConnectionArgs(connectionArgs);

  if (first == null && last == null) {
    throw new ParseError('"first" or "last" value required');
  }
  if (first && first > FIRST_MAX) {
    throw new ParseError(`"first" must be up to ${FIRST_MAX}`);
  }
  if (last && last > LAST_MAX) {
    throw new ParseError(`"last" must be up to ${LAST_MAX}`);
  }

  const direction = {
    [OrderDirection.Asc]: Prisma.Prisma.SortOrder.asc,
    [OrderDirection.Desc]: Prisma.Prisma.SortOrder.desc,
  }[orderBy.direction];

  const orderByToUse = {
    [UserOrderField.CreatedAt]: [{ createdAt: direction }, { id: direction }],
    [UserOrderField.UpdatedAt]: [{ updatedAt: direction }, { id: direction }],
  }[orderBy.field];

  return { first, after, last, before, orderBy: orderByToUse };
};

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.ts");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.ts");
  const { ParseError: ParseErr } = await import("../common/parsers.ts");

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
    const valid = [{ first: 10 }, { last: 10 }, { first: FIRST_MAX }, { last: LAST_MAX }];

    const invalid = [
      {},
      { first: null },
      { last: null },
      { first: null, last: null },
      { first: FIRST_MAX + 1 },
      { last: LAST_MAX + 1 },
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
