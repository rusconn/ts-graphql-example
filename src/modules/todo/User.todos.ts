import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";

import * as Prisma from "@/prisma/mod.ts";
import { parseConnectionArgs, ParseError } from "../common/parsers.ts";
import { full } from "../common/resolvers.ts";
import type { UserResolvers, UserTodosArgs } from "../common/schema.ts";
import { OrderDirection, TodoOrderField } from "../common/schema.ts";
import { cursorConnections, orderOptions } from "../common/typeDefs.ts";
import { isAdminOrUserOwner } from "./common/authorizer.ts";

const FIRST_MAX = 50;
const LAST_MAX = 50;

export const typeDef = /* GraphQL */ `
  extend type User {
    todos(
      "max: ${FIRST_MAX}"
      first: Int
      after: String
      "max: ${LAST_MAX}"
      last: Int
      before: String
      orderBy: TodoOrder! = { field: UPDATED_AT, direction: DESC }
    ): TodoConnection
  }

  ${orderOptions("Todo")}
  ${cursorConnections("Todo", { totalCount: "Int!" })}
`;

export const resolver: UserResolvers["todos"] = async (parent, args, context, info) => {
  authorizer(context.user, parent);

  const { first, after, last, before, orderBy } = parser(args);

  return findManyCursorConnection(
    findManyArgs =>
      context.prisma.todo
        .findMany({
          ...findManyArgs,
          where: { userId: parent.id },
          orderBy,
        })
        .then(todos => todos.map(full)),
    () =>
      context.prisma.todo.count({
        where: { userId: parent.id },
      }),
    { first, after, last, before },
    { resolveInfo: info }
  );
};

const authorizer = isAdminOrUserOwner;

const parser = (args: UserTodosArgs) => {
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
    [TodoOrderField.CreatedAt]: [{ createdAt: direction }, { id: direction }],
    [TodoOrderField.UpdatedAt]: [{ updatedAt: direction }, { id: direction }],
  }[orderBy.field];

  return { first, after, last, before, orderBy: orderByToUse };
};

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.ts");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.ts");
  const { ParseError: ParseErr } = await import("../common/parsers.ts");

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
