import type { Follow } from "../../../db/models/follow.ts";
import * as followId from "../../../db/models/follow/id.ts";
import { getCursorConnection } from "../../../lib/graphql/cursorConnections/get.ts";
import { cursorConnection } from "../../../lib/graphql/cursorConnections/sdl.ts";
import { FollowerSortKeys, type UserFollowersArgs, type UserResolvers } from "../../../schema.ts";
import { badUserInputErr } from "../../common/errors/badUserInput.ts";
import { parseConnectionArgs } from "../../common/parsers/connectionArgs.ts";
import type { User } from "../mapper.ts";
import { parseUserCursor } from "../parsers/cursor.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type User {
    followers(
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

      sortKey: FollowerSortKeys! = FOLLOWED_AT
    ): FollowerConnection
  }

  enum FollowerSortKeys {
    FOLLOWED_AT
  }

  ${cursorConnection({
    nodeType: "User",
    edgeType: "Follower",
    additionals: {
      connectionFields: {
        totalCount: "Int",
      },
      edgeFields: {
        followedAt: "DateTime",
      },
    },
  })}
`;

export const resolver: UserResolvers["followers"] = async (parent, args, context, info) => {
  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { first, after, last, before, reverse } = parsed;

  const connection = await getCursorConnection<User & { fid: Follow["id"] }, Pick<Follow, "id">>(
    async ({ cursor, limit, backward }) => {
      const page = await context.api.user.loadFollowerPage(parent.id, {
        cursor: cursor?.id,
        limit,
        reverse: reverse !== backward,
      });

      return backward ? page.reverse() : page;
    },
    () => context.api.user.loadFollowerCount(parent.id),
    { first, after, last, before },
    {
      resolveInfo: info,
      getCursor: (record) => ({ id: record.fid }),
      recordToEdge: (record) => ({
        node: record,
        followedAt: followId.date(record.fid),
      }),
    },
  );

  if (connection instanceof Error) {
    throw connection;
  }

  return connection;
};

const parseArgs = (args: UserFollowersArgs) => {
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
    const sortKey = FollowerSortKeys.FollowedAt;

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
