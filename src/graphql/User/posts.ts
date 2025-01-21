import type { Post } from "../../db/models/post.ts";
import { getCursorConnection } from "../../lib/graphql/cursorConnections/get.ts";
import { UserPostSortKeys, type UserPostsArgs, type UserResolvers } from "../../schema.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { parseConnectionArgs } from "../_parsers/connectionArgs.ts";
import { parsePostCursor } from "../_parsers/post/cursor.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type User {
    posts(
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

      sortKey: UserPostSortKeys! = CREATED_AT
    ): PostConnection
  }

  enum UserPostSortKeys {
    CREATED_AT
    UPDATED_AT
  }

  type PostConnection {
    pageInfo: PageInfo!
    edges: [PostEdge]
    nodes: [Post]
    totalCount: Int
  }

  type PostEdge {
    cursor: String!
    node: Post
  }
`;

export const resolver: UserResolvers["posts"] = async (parent, args, context, info) => {
  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { first, after, last, before, reverse, sortKey } = parsed;

  const connection = await getCursorConnection<Post, Post["id"]>(
    async ({ cursor, limit, backward }) => {
      const page = await context.api.post.loadTheirPage(parent.id, {
        cursor,
        limit,
        sortKey: {
          [UserPostSortKeys.CreatedAt]: "createdAt" as const,
          [UserPostSortKeys.UpdatedAt]: "updatedAt" as const,
        }[sortKey],
        reverse: reverse !== backward,
      });

      return backward ? page.reverse() : page;
    },
    () => context.api.post.loadTheirCount(parent.id),
    { first, after, last, before },
    { resolveInfo: info },
  );

  if (connection instanceof Error) {
    throw connection;
  }

  return connection;
};

const parseArgs = (args: UserPostsArgs) => {
  const connectionArgs = parseConnectionArgs(args, {
    firstMax: FIRST_MAX,
    lastMax: LAST_MAX,
    parseCursor: parsePostCursor,
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
    const sortKey = UserPostSortKeys.CreatedAt;

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
