import type { Liker } from "../../datasources/user.ts";
import type { Like } from "../../db/models/like.ts";
import type { User } from "../../db/models/user.ts";
import { getCursorConnection } from "../../lib/graphql/cursorConnections/get.ts";
import { LikerSortKeys, type PostLikersArgs, type PostResolvers } from "../../schema.ts";
import { likeCursor } from "../_adapters/like/cursor.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { parseConnectionArgs } from "../_parsers/connectionArgs.ts";
import { parseLikeCursor } from "../_parsers/like/cursor.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type Post {
    likers(
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

      sortKey: LikerSortKeys! = LIKED_AT
    ): LikerConnection
  }

  enum LikerSortKeys {
    LIKED_AT
  }

  type LikerConnection {
    pageInfo: PageInfo!
    edges: [LikerEdge]
    nodes: [User]
    totalCount: Int
  }

  type LikerEdge {
    cursor: String!
    node: User
    likedAt: DateTime
  }
`;

export const resolver: PostResolvers["likers"] = async (parent, args, context, info) => {
  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { first, after, last, before, reverse } = parsed;

  const connection = await getCursorConnection<Liker, Like, User>(
    async ({ cursor, limit, backward }) => {
      const page = await context.api.user.loadLikerPage(parent.id, {
        cursor,
        limit,
        reverse: reverse !== backward,
      });

      return backward ? page.reverse() : page;
    },
    () => context.api.like.loadCountByPostId(parent.id),
    { first, after, last, before },
    {
      resolveInfo: info,
      encodeCursor: likeCursor,
      recordToEdge: (record) => ({
        node: record.user,
        likedAt: record.cursor.createdAt,
      }),
    },
  );

  if (connection instanceof Error) {
    throw connection;
  }

  return connection;
};

const parseArgs = (args: PostLikersArgs) => {
  const connectionArgs = parseConnectionArgs(args, {
    firstMax: FIRST_MAX,
    lastMax: LAST_MAX,
    parseCursor: parseLikeCursor,
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
    const sortKey = LikerSortKeys.LikedAt;

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
