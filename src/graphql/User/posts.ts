import { getCursorConnection } from "../../lib/graphql/cursorConnections/get.ts";
import type { Post } from "../../models/post.ts";
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
    ): UserPostConnection @semanticNonNull
  }

  enum UserPostSortKeys {
    CREATED_AT
    UPDATED_AT
  }

  type UserPostConnection {
    pageInfo: PageInfo!
    edges: [UserPostEdge] @semanticNonNull(levels: [0, 1])
    nodes: [Post] @semanticNonNull(levels: [0, 1])
    totalCount: Int @semanticNonNull
  }

  type UserPostEdge {
    cursor: String!
    node: Post @semanticNonNull
  }
`;

export const resolver: UserResolvers["posts"] = async (parent, args, context, info) => {
  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { connectionArgs, reverse, sortKey } = parsed;

  return await getCursorConnection<Post, Post["id"]>(
    async ({ backward, ...exceptBackward }) =>
      context.api.post.loadTheirPage({
        authorId: parent.id,
        sortKey: {
          [UserPostSortKeys.CreatedAt]: "createdAt" as const,
          [UserPostSortKeys.UpdatedAt]: "updatedAt" as const,
        }[sortKey],
        reverse: reverse !== backward,
        ...exceptBackward,
      }),
    () => context.api.post.loadTheirCount(parent.id),
    connectionArgs,
    { resolveInfo: info },
  );
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
    connectionArgs,
    reverse: args.reverse,
    sortKey: args.sortKey,
  };
};
