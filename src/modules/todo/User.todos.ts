import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";

import * as Prisma from "@/prisma/mod.js";
import { parseConnectionArgs, ParseError } from "../common/parsers.js";
import { full } from "../common/resolvers.js";
import { UserResolvers, UserTodosArgs, OrderDirection, TodoOrderField } from "../common/schema.js";
import { cursorConnections, orderOptions } from "../common/typeDefs.js";
import { isAdminOrUserOwner } from "./common/authorizer.js";

export const typeDef = /* GraphQL */ `
  extend type User {
    todos(
      "max: 50"
      first: Int
      after: String
      "max: 50"
      last: Int
      before: String
      orderBy: TodoOrder! = { field: UPDATED_AT, direction: DESC }
    ): TodoConnection
  }

  ${orderOptions("Todo")}
  ${cursorConnections("Todo", { totalCount: "Int!" })}
`;

export const resolver: UserResolvers["todos"] = async (parent, args, context, resolveInfo) => {
  authorizer(context.user, parent);

  const { first, last, before, after, orderBy } = parser(args);

  return findManyCursorConnection(
    async findManyArgs =>
      context.prisma.todo
        .findMany({
          ...findManyArgs,
          where: { userId: parent.id },
          orderBy,
        })
        .then(todos => todos.map(full)),
    () => context.prisma.todo.count({ where: { userId: parent.id } }),
    { first, last, before, after },
    { resolveInfo }
  );
};

const authorizer = isAdminOrUserOwner;

const parser = (args: UserTodosArgs) => {
  const { orderBy, ...connectionArgs } = args;

  const { first, last, before, after } = parseConnectionArgs(connectionArgs);

  if (first == null && last == null) {
    throw new ParseError("`first` or `last` value required");
  }
  if (first && first > 50) {
    throw new ParseError("`first` must be up to 50");
  }
  if (last && last > 50) {
    throw new ParseError("`last` must be up to 50");
  }

  const firstToUse = first == null && last == null ? 20 : first;

  const directionToUse =
    orderBy.direction === OrderDirection.Asc
      ? Prisma.Prisma.SortOrder.asc
      : Prisma.Prisma.SortOrder.desc;

  const orderByToUse =
    orderBy.field === TodoOrderField.CreatedAt
      ? [{ createdAt: directionToUse }, { id: directionToUse }]
      : [{ updatedAt: directionToUse }, { id: directionToUse }];

  return { first: firstToUse, last, before, after, orderBy: orderByToUse };
};

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.js");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.js");
  const { ParseError: ParseErr } = await import("../common/parsers.js");

  describe("Authorization", () => {
    const allow = [
      [admin, admin],
      [admin, alice],
      [alice, alice],
    ] as const;

    const deny = [
      [alice, admin],
      [guest, admin],
      [guest, alice],
    ] as const;

    test.each(allow)("allow %#", (user, parent) => {
      expect(() => authorizer(user, parent)).not.toThrow(AuthErr);
    });

    test.each(deny)("deny %#", (user, parent) => {
      expect(() => authorizer(user, parent)).toThrow(AuthErr);
    });
  });

  describe("Parsing", () => {
    const firstMax = 50;
    const lastMax = 50;

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
      field: TodoOrderField.UpdatedAt,
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
