import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";

import { authAdmin } from "../../common/authorizers.ts";
import { parseConnectionArgs, parseErr } from "../../common/parsers.ts";
import { full } from "../../common/resolvers.ts";
import type { QueryResolvers } from "../../common/schema.ts";
import { OrderDirection, UserOrderField } from "../../common/schema.ts";
import { cursorConnections, orderOptions } from "../../common/typeDefs.ts";

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
  authAdmin(context.user);

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
    [UserOrderField.CreatedAt]: [{ createdAt: direction }, { id: direction }],
    [UserOrderField.UpdatedAt]: [{ updatedAt: direction }, { id: direction }],
  }[orderBy.field];

  return findManyCursorConnection(
    findManyArgs =>
      context.prisma.user.findMany({
        ...findManyArgs,
        orderBy: orderByToUse,
      }),
    () => context.prisma.user.count(),
    { first, after, last, before },
    {
      recordToEdge: record => ({ node: full(record) }),
      resolveInfo: info,
    }
  );
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../common/schema.ts");
  const { dummyContext } = await import("../../common/tests.ts");
  const { context } = await import("../common/test.ts");

  type Args = Parameters<typeof resolver>[1];
  type Params = Parameters<typeof dummyContext>[0];

  const valid = {
    args: {
      first: 10,
      orderBy: {
        field: UserOrderField.CreatedAt,
        direction: OrderDirection.Desc,
      },
    },
    user: context.admin,
  };

  const resolve = ({
    args = valid.args,
    user = valid.user,
  }: {
    args?: Args;
    user?: Params["user"];
  }) => {
    return resolver({}, args, dummyContext({ user }));
  };

  describe("Authorization", () => {
    const allows = [context.admin];

    const denies = [context.alice, context.guest];

    test.each(allows)("allows %#", async user => {
      await resolve({ user });
    });

    test.each(denies)("denies %#", async user => {
      expect.assertions(1);
      try {
        await resolve({ user });
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
