import { getCursorConnection } from "../../lib/graphql/cursorConnections/get.ts";
import type { Post } from "../../models/post.ts";
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
    ): PostConnection @semanticNonNull
  }

  enum PostSortKeys {
    CREATED_AT
    UPDATED_AT
  }

  type PostConnection {
    pageInfo: PageInfo!
    edges: [PostEdge] @semanticNonNull(levels: [0, 1])
    nodes: [Post] @semanticNonNull(levels: [0, 1])
    totalCount: Int @semanticNonNull
  }

  type PostEdge {
    cursor: String!
    node: Post @semanticNonNull
  }
`;

export const resolver: QueryResolvers["posts"] = async (_parent, args, context, info) => {
  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { connectionArgs, reverse, sortKey } = parsed;

  return await getCursorConnection<Post, Post["id"]>(
    ({ backward, ...exceptBackward }) =>
      context.api.post.getPage({
        sortKey: {
          [PostSortKeys.CreatedAt]: "createdAt" as const,
          [PostSortKeys.UpdatedAt]: "updatedAt" as const,
        }[sortKey],
        reverse: reverse !== backward,
        ...exceptBackward,
      }),
    context.api.post.count,
    connectionArgs,
    { resolveInfo: info },
  );
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
    connectionArgs,
    reverse: args.reverse,
    sortKey: args.sortKey,
  };
};
