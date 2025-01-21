import type { Blocker } from "../../datasources/user.ts";
import type { Block } from "../../db/models/block.ts";
import type { User } from "../../db/models/user.ts";
import { getCursorConnection } from "../../lib/graphql/cursorConnections/get.ts";
import { BlockerSortKeys, type UserBlockersArgs, type UserResolvers } from "../../schema.ts";
import { blockCursor } from "../_adapters/block/cursor.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { parseBlockCursor } from "../_parsers/block/cursor.ts";
import { parseConnectionArgs } from "../_parsers/connectionArgs.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type User {
    blockers(
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

      sortKey: BlockerSortKeys! = BLOCKED_AT
    ): BlockerConnection
  }

  enum BlockerSortKeys {
    BLOCKED_AT
  }

  type BlockerConnection {
    pageInfo: PageInfo!
    edges: [BlockerEdge]
    nodes: [User]
    totalCount: Int
  }

  type BlockerEdge {
    cursor: String!
    node: User
    blockedAt: DateTime
  }
`;

export const resolver: UserResolvers["blockers"] = async (parent, args, context, info) => {
  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { first, after, last, before, reverse } = parsed;

  const connection = await getCursorConnection<Blocker, Block, User>(
    async ({ cursor, limit, backward }) => {
      const page = await context.api.user.loadBlockerPage(parent.id, {
        cursor,
        limit,
        reverse: reverse !== backward,
      });

      return backward ? page.reverse() : page;
    },
    () => context.api.user.loadBlockerCount(parent.id),
    { first, after, last, before },
    {
      resolveInfo: info,
      encodeCursor: blockCursor,
      recordToEdge: (record) => ({
        node: record.user,
        blockedAt: record.cursor.createdAt,
      }),
    },
  );

  if (connection instanceof Error) {
    throw connection;
  }

  return connection;
};

const parseArgs = (args: UserBlockersArgs) => {
  const connectionArgs = parseConnectionArgs(args, {
    firstMax: FIRST_MAX,
    lastMax: LAST_MAX,
    parseCursor: parseBlockCursor,
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
    const sortKey = BlockerSortKeys.BlockedAt;

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
