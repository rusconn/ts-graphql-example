import { getCursorConnection } from "../../../lib/graphql/cursorConnections/get.ts";
import type { QueryResolvers, QueryUsersArgs } from "../../../schema.ts";
import { UserSortKeys } from "../../../schema.ts";
import { authAdmin } from "../../common/authorizers/admin.ts";
import { badUserInputErr } from "../../common/errors/badUserInput.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import { parseConnectionArgs } from "../../common/parsers/connectionArgs.ts";
import type { User } from "../mapper.ts";
import { parseUserCursor } from "../parsers/cursor.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type Query {
    users(
      """
      max: ${FIRST_MAX}
      """
      first: Int

      after: String

      """
      max: ${LAST_MAX}
      """
      last: Int

      before: String

      reverse: Boolean! = true

      sortKey: UserSortKeys! = CREATED_AT
    ): UserConnection
  }

  enum UserSortKeys {
    CREATED_AT
    UPDATED_AT
  }

  type UserConnection {
    pageInfo: PageInfo!
    edges: [UserEdge]
    nodes: [User]
    totalCount: Int
  }

  type UserEdge {
    cursor: String!
    node: User
  }
`;

export const resolver: QueryResolvers["users"] = async (_parent, args, context, info) => {
  const authed = authAdmin(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { first, after, last, before, reverse, sortKey } = parsed;

  const connection = await getCursorConnection<User, Pick<User, "id">>(
    async ({ cursor, limit, backward }) => {
      const page = await context.api.user.getPage({
        cursor: cursor?.id,
        sortKey: {
          [UserSortKeys.CreatedAt]: "createdAt" as const,
          [UserSortKeys.UpdatedAt]: "updatedAt" as const,
        }[sortKey],
        limit,
        reverse: reverse !== backward,
      });

      return backward ? page.reverse() : page;
    },
    context.api.user.count,
    { first, after, last, before },
    { resolveInfo: info },
  );

  if (connection instanceof Error) {
    throw connection;
  }

  return connection;
};

const parseArgs = (args: QueryUsersArgs) => {
  const connectionArgs = parseConnectionArgs(args, {
    firstMax: FIRST_MAX,
    lastMax: LAST_MAX,
    parseCursor: parseUserCursor,
  });

  if (connectionArgs instanceof Error) {
    return connectionArgs;
  }

  return {
    ...connectionArgs,
    reverse: args.reverse,
    sortKey: args.sortKey,
  };
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const valids = [{ first: 10 }, { last: 10 }, { first: FIRST_MAX }, { last: LAST_MAX }];

    const invalids = [{ first: FIRST_MAX + 1 }, { last: LAST_MAX + 1 }];

    const reverse = true;
    const sortKey = UserSortKeys.CreatedAt;

    test.each(valids)("valids %#", (args) => {
      const parsed = parseArgs({ ...args, reverse, sortKey });
      expect(parsed instanceof Error).toBe(false);
    });

    test.each(invalids)("invalids %#", (args) => {
      const parsed = parseArgs({ ...args, reverse, sortKey });
      expect(parsed instanceof Error).toBe(true);
    });
  });
}
