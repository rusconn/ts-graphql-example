import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";

import { parseConnectionArgs, parseErr } from "../../common/parsers.ts";
import type { UserResolvers } from "../../common/schema.ts";
import { OrderDirection, TodoOrderField } from "../../common/schema.ts";
import { cursorConnections, orderOptions } from "../../common/typeDefs.ts";
import { authAdminOrUserOwner } from "../common/authorizer.ts";

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
  ${cursorConnections("Todo", { totalCount: "Int" })}
`;

export const resolver: UserResolvers["todos"] = async (parent, args, context, info) => {
  authAdminOrUserOwner(context.user, parent);

  const { orderBy, ...connectionArgs } = args;

  const { first, after, last, before } = parseConnectionArgs(connectionArgs);

  if (first == null && last == null) {
    throw parseErr('"first" or "last" value required');
  }
  if (first && first > FIRST_MAX) {
    throw parseErr(`"first" must be up to ${FIRST_MAX}`);
  }
  if (last && last > LAST_MAX) {
    throw parseErr(`"last" must be up to ${LAST_MAX}`);
  }

  const direction = {
    [OrderDirection.Asc]: "asc" as const,
    [OrderDirection.Desc]: "desc" as const,
  }[orderBy.direction];

  const orderByToUse = {
    [TodoOrderField.CreatedAt]: [{ createdAt: direction }, { id: direction }],
    [TodoOrderField.UpdatedAt]: [{ updatedAt: direction }, { id: direction }],
  }[orderBy.field];

  return findManyCursorConnection(
    findManyArgs =>
      context.prisma.user
        .findUniqueOrThrow({
          where: { id: parent.id },
        })
        .todos({
          ...findManyArgs,
          orderBy: orderByToUse,
        }),
    () =>
      context.prisma.user
        .findUniqueOrThrow({
          where: { id: parent.id },
        })
        .todos({
          select: { id: true },
        })
        .then(todos => todos.length),
    { first, after, last, before },
    { resolveInfo: info },
  );
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../common/schema.ts");
  const { dummyContext } = await import("../../common/tests.ts");
  const { context, db } = await import("../../user/common/test.ts");

  type Parent = Parameters<typeof resolver>[0];
  type Args = Parameters<typeof resolver>[1];
  type Params = Parameters<typeof dummyContext>[0];

  const valid = {
    parent: db.admin,
    args: {
      first: 10,
      orderBy: {
        field: TodoOrderField.UpdatedAt,
        direction: OrderDirection.Desc,
      },
    },
    user: context.admin,
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
    const prisma = {
      user: {
        findUniqueOrThrow: () => ({
          todos: async () => [],
        }),
      },
    } as unknown as Params["prisma"];

    return resolver(parent, args, dummyContext({ prisma, user }));
  };

  describe("Authorization", () => {
    const allows = [
      [context.admin, db.admin],
      [context.admin, db.alice],
      [context.alice, db.alice],
    ] as const;

    const denies = [
      [context.alice, db.admin],
      [context.guest, db.admin],
      [context.guest, db.alice],
    ] as const;

    test.each(allows)("allows %#", async (user, parent) => {
      await resolve({ parent, user });
    });

    test.each(denies)("denies %#", async (user, parent) => {
      expect.assertions(1);
      try {
        await resolve({ parent, user });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.Forbidden);
      }
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

    test.each(valids)("valids %#", async args => {
      await resolve({ args: { ...args, orderBy } });
    });

    test.each(invalids)("invalids %#", async args => {
      expect.assertions(1);
      try {
        await resolve({ args: { ...args, orderBy } });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.BadUserInput);
      }
    });
  });
}
