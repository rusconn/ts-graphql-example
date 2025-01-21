import type { Reply } from "../../datasources/post.ts";
import { getCursorConnection } from "../../lib/graphql/cursorConnections/get.ts";
import type { Post } from "../../models/post.ts";
import * as PostId from "../../models/post/id.ts";
import type { PostRepliesArgs, PostResolvers } from "../../schema.ts";
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
    ): ReplyConnection @semanticNonNull
  }

  enum ReplySortKeys {
    REPLIED_AT
  }

  type ReplyConnection {
    pageInfo: PageInfo!
    edges: [ReplyEdge] @semanticNonNull(levels: [0, 1])
    nodes: [Post] @semanticNonNull(levels: [0, 1])
    totalCount: Int @semanticNonNull
  }

  type ReplyEdge {
    cursor: String!
    node: Post @semanticNonNull
    repliedAt: DateTime @semanticNonNull
  }
`;

export const resolver: PostResolvers["replies"] = async (parent, args, context, info) => {
  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { connectionArgs, reverse } = parsed;

  return await getCursorConnection<Reply, Post["id"]>(
    ({ backward, ...exceptBackward }) =>
      context.api.post.loadReplyPage({
        postId: parent.id,
        reverse: reverse !== backward,
        ...exceptBackward,
      }),
    () => context.api.post.loadReplyCount(parent.id),
    connectionArgs,
    {
      resolveInfo: info,
      itemToEdge: (item) => ({
        node: item,
        repliedAt: PostId.date(item.id),
      }),
    },
  );
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
    connectionArgs,
    reverse: args.reverse,
    sortKey: args.sortKey,
  };
};
