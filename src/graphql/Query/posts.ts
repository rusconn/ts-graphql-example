import type { Post } from "../../db/models/post.ts";
import { getCursorConnection } from "../../lib/graphql/cursorConnections/get.ts";
import type { QueryPostsArgs, QueryResolvers } from "../../schema.ts";
import { PostSortKeys } from "../../schema.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { parseConnectionArgs } from "../_parsers/connectionArgs.ts";
import { parsePostCursor } from "../_parsers/post/cursor.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type Query {
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

      sortKey: PostSortKeys! = CREATED_AT
    ): PostConnection
  }

  enum PostSortKeys {
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

export const resolver: QueryResolvers["posts"] = async (_parent, args, context, info) => {
  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { first, after, last, before, reverse, sortKey } = parsed;

  const connection = await getCursorConnection<Post, Post["id"]>(
    async ({ cursor, limit, backward }) => {
      const page = await context.api.post.getPage({
        cursor,
        sortKey: {
          [PostSortKeys.CreatedAt]: "createdAt" as const,
          [PostSortKeys.UpdatedAt]: "updatedAt" as const,
        }[sortKey],
        limit,
        reverse: reverse !== backward,
      });

      return backward ? page.reverse() : page;
    },
    context.api.post.count,
    { first, after, last, before },
    { resolveInfo: info },
  );

  if (connection instanceof Error) {
    throw connection;
  }

  return connection;
};

const parseArgs = (args: QueryPostsArgs) => {
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
    const sortKey = PostSortKeys.CreatedAt;

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
