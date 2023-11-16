import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";

import * as Prisma from "@/prisma/mod.ts";
import { parseConnectionArgs, ParseError } from "../common/parsers.ts";
import { full } from "../common/resolvers.ts";
import type { UserResolvers } from "../common/schema.ts";
import { OrderDirection, TodoOrderField } from "../common/schema.ts";
import { cursorConnections, orderOptions } from "../common/typeDefs.ts";
import { authAdminOrUserOwner } from "./common/authorizer.ts";

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
  authAdminOrUserOwner(context.user, parent);

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

  return findManyCursorConnection(
    findManyArgs =>
      context.prisma.todo
        .findMany({
          ...findManyArgs,
          where: { userId: parent.id },
          orderBy: orderByToUse,
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

if (import.meta.vitest) {
  const { admin, alice, guest } = await import("tests/data/context.ts");
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.ts");
  const { ParseError: ParseErr } = await import("../common/parsers.ts");
  const { dummyContext } = await import("../common/tests.ts");

  type Parent = Parameters<typeof resolver>[0];
  type Args = Parameters<typeof resolver>[1];
  type Params = Parameters<typeof dummyContext>[0];

  const valid = {
    parent: full(admin),
    args: {
      first: 10,
      orderBy: {
        field: TodoOrderField.UpdatedAt,
        direction: OrderDirection.Desc,
      },
    },
    user: admin,
  };

  const resolve = ({
    parent = valid.parent,
    args = valid.args,
    user = valid.user,
  }: {
    parent?: Parent;
    args?: Args;
    user?: Params["user"];
  }) => {
    return resolver(parent, args, dummyContext({ user }));
  };

  describe("Authorization", () => {
    const allows = [
      [admin, admin],
      [admin, alice],
      [alice, alice],
    ] as const;

    const denys = [
      [alice, admin],
      [guest, admin],
      [guest, alice],
    ] as const;

    test.each(allows)("allows %#", (user, parent) => {
      void expect(resolve({ parent: full(parent), user })).resolves.not.toThrow(AuthErr);
    });

    test.each(denys)("denys %#", (user, parent) => {
      void expect(resolve({ parent: full(parent), user })).rejects.toThrow(AuthErr);
    });
  });

  describe("Parsing", () => {
    const valids = [{ first: 10 }, { last: 10 }, { first: FIRST_MAX }, { last: LAST_MAX }];

    const invalids = [
      {},
      { first: null },
      { last: null },
      { first: null, last: null },
      { first: FIRST_MAX + 1 },
      { last: LAST_MAX + 1 },
    ];

    const { orderBy } = valid.args;

    test.each(valids)("valids %#", args => {
      void expect(resolve({ args: { ...args, orderBy } })).resolves.not.toThrow(ParseErr);
    });

    test.each(invalids)("invalids %#", args => {
      void expect(resolve({ args: { ...args, orderBy } })).rejects.toThrow(ParseErr);
    });
  });
}
