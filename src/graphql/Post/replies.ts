import type { Post } from "../../db/models/post.ts";
import * as postId from "../../db/models/post/id.ts";
import { getCursorConnection } from "../../lib/graphql/cursorConnections/get.ts";
import { type PostRepliesArgs, type PostResolvers, ReplySortKeys } from "../../schema.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { parseConnectionArgs } from "../_parsers/connectionArgs.ts";
import { parsePostCursor } from "../_parsers/post/cursor.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type Post {
    replies(
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

      reverse: Boolean! = false

      sortKey: ReplySortKeys! = REPLIED_AT
    ): ReplyConnection
  }

  enum ReplySortKeys {
    REPLIED_AT
  }

  type ReplyConnection {
    pageInfo: PageInfo!
    edges: [ReplyEdge]
    nodes: [Post]
    totalCount: Int
  }

  type ReplyEdge {
    cursor: String!
    node: Post
    repliedAt: DateTime
  }
`;

export const resolver: PostResolvers["replies"] = async (parent, args, context, info) => {
  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { first, after, last, before, reverse } = parsed;

  const connection = await getCursorConnection<Post, Post["id"]>(
    async ({ cursor, limit, backward }) => {
      const page = await context.api.post.loadReplyPage(parent.id, {
        cursor,
        limit,
        reverse: reverse !== backward,
      });

      return backward ? page.reverse() : page;
    },
    () => context.api.post.loadReplyCount(parent.id),
    { first, after, last, before },
    {
      resolveInfo: info,
      recordToEdge: (record) => ({
        node: record,
        repliedAt: postId.date(record.id),
      }),
    },
  );

  if (connection instanceof Error) {
    throw connection;
  }

  return connection;
};

const parseArgs = (args: PostRepliesArgs) => {
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
    const sortKey = ReplySortKeys.RepliedAt;

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
