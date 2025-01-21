import type { Fav } from "../../datasources/post.ts";
import type { Like } from "../../db/models/like.ts";
import type { Post } from "../../db/models/post.ts";
import { getCursorConnection } from "../../lib/graphql/cursorConnections/get.ts";
import { LikedPostSortKeys, type UserLikedPostsArgs, type UserResolvers } from "../../schema.ts";
import { likeCursor } from "../_adapters/like/cursor.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { parseConnectionArgs } from "../_parsers/connectionArgs.ts";
import { parseLikeCursor } from "../_parsers/like/cursor.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type User {
    likedPosts(
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

      sortKey: LikedPostSortKeys! = LIKED_AT
    ): LikedPostConnection
  }

  enum LikedPostSortKeys {
    LIKED_AT
  }

  type LikedPostConnection {
    pageInfo: PageInfo!
    edges: [LikedPostEdge]
    nodes: [Post]
    totalCount: Int
  }

  type LikedPostEdge {
    cursor: String!
    node: Post
    likedAt: DateTime
  }
`;

export const resolver: UserResolvers["likedPosts"] = async (parent, args, context, info) => {
  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { first, after, last, before, reverse } = parsed;

  const connection = await getCursorConnection<Fav, Like, Post>(
    async ({ cursor, limit, backward }) => {
      const page = await context.api.post.loadTheirFavPage(parent.id, {
        cursor,
        limit,
        reverse: reverse !== backward,
      });

      return backward ? page.reverse() : page;
    },
    () => context.api.post.loadTheirFavCount(parent.id),
    { first, after, last, before },
    {
      resolveInfo: info,
      encodeCursor: likeCursor,
      recordToEdge: (record) => ({
        node: record.post,
        likedAt: record.cursor.createdAt,
      }),
    },
  );

  if (connection instanceof Error) {
    throw connection;
  }

  return connection;
};

const parseArgs = (args: UserLikedPostsArgs) => {
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
    const sortKey = LikedPostSortKeys.LikedAt;

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
