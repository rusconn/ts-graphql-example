import { getCursorConnection } from "../../../lib/graphql/cursorConnections/get.ts";
import { cursorConnection } from "../../../lib/graphql/cursorConnections/sdl.ts";
import { BlockerSortKeys, type UserBlockersArgs, type UserResolvers } from "../../../schema.ts";
import { badUserInputErr } from "../../common/errors/badUserInput.ts";
import { parseConnectionArgs } from "../../common/parsers/connectionArgs.ts";
import * as blockId from "../internal/blockId.ts";
import { parseUserCursor } from "../parsers/cursor.ts";

const FIRST_MAX = 50;
const LAST_MAX = 50;

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

  ${cursorConnection({
    nodeType: "User",
    edgeType: "Blocker",
    additionals: {
      connectionFields: {
        totalCount: "Int",
      },
      edgeFields: {
        blockedAt: "DateTime",
      },
    },
  })}
`;

export const resolver: UserResolvers["blockers"] = async (parent, args, context, info) => {
  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { first, after, last, before, reverse } = parsed;

  const connection = await getCursorConnection(
    async ({ cursor, limit, backward }) => {
      const [direction, comp] =
        reverse === backward //
          ? (["asc", ">"] as const)
          : (["desc", "<"] as const);

      const page = await context.db
        .selectFrom("User")
        .innerJoin("Block", "User.id", "Block.blockeeId")
        .where("User.id", "=", parent.id)
        .$if(cursor != null, (qb) => qb.where(({ eb }) => eb("Block.id", comp, cursor!.id)))
        .selectAll("User")
        .select("Block.id as bid")
        .orderBy("bid", direction)
        .limit(limit)
        .execute();

      return backward ? page.reverse() : page;
    },
    () =>
      context.db
        .selectFrom("Block")
        .where("blockeeId", "=", parent.id)
        .select(({ fn }) => fn.countAll().as("count"))
        .executeTakeFirstOrThrow()
        .then((result) => Number(result.count)),
    { first, after, last, before },
    {
      resolveInfo: info,
      getCursor: (record) => ({ id: record.bid }),
      recordToEdge: (record) => ({
        node: record,
        blockedAt: blockId.date(record.bid),
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
