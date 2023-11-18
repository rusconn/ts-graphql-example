import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";

import * as Prisma from "@/prisma/mod.ts";
import { authAdmin } from "../common/authorizers.ts";
import { parseConnectionArgs, ParseError } from "../common/parsers.ts";
import { full } from "../common/resolvers.ts";
import type { QueryResolvers } from "../common/schema.ts";
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
  authAdmin(context.user);

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

  return findManyCursorConnection(
    findManyArgs =>
      context.prisma.user
        .findMany({
          ...findManyArgs,
          orderBy: orderByToUse,
        })
        .then(users => users.map(full)),
    () => context.prisma.user.count(),
    { first, after, last, before },
    { resolveInfo: info }
  );
};

if (import.meta.vitest) {
  const { AuthorizationError: AuthErr } = await import("../common/authorizers.ts");
  const { ParseError: ParseErr } = await import("../common/parsers.ts");
  const { dummyContext } = await import("../common/tests.ts");
  const { context } = await import("./common/test.ts");

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

    const denys = [context.alice, context.guest];

    test.each(allows)("allows %#", user => {
      void expect(resolve({ user })).resolves.not.toThrow(AuthErr);
    });

    test.each(denys)("denys %#", user => {
      void expect(resolve({ user })).rejects.toThrow(AuthErr);
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
