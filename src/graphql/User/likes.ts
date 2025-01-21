import type { Fav } from "../../datasources/post.ts";
import { getCursorConnection } from "../../lib/graphql/cursorConnections/get.ts";
import type { Like } from "../../models/like.ts";
import type { Post } from "../../models/post.ts";
import type { UserLikesArgs, UserResolvers } from "../../schema.ts";
import { likeCursor } from "../_adapters/like/cursor.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { parseConnectionArgs } from "../_parsers/connectionArgs.ts";
import { parseLikeCursor } from "../_parsers/like/cursor.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type User {
    likes(
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

      sortKey: LikeSortKeys! = LIKED_AT
    ): LikeConnection @semanticNonNull
  }

  enum LikeSortKeys {
    LIKED_AT
  }

  type LikeConnection {
    pageInfo: PageInfo!
    edges: [LikeEdge] @semanticNonNull(levels: [0, 1])
    nodes: [Post] @semanticNonNull(levels: [0, 1])
    totalCount: Int @semanticNonNull
  }

  type LikeEdge {
    cursor: String!
    node: Post @semanticNonNull
    likedAt: DateTime @semanticNonNull
  }
`;

export const resolver: UserResolvers["likes"] = async (parent, args, context, info) => {
  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { connectionArgs, reverse } = parsed;

  return await getCursorConnection<Fav, Like, Post>(
    ({ backward, ...exceptBackward }) =>
      context.api.post.loadTheirFavPage({
        userId: parent.id,
        reverse: reverse !== backward,
        ...exceptBackward,
      }),
    () => context.api.post.loadTheirFavCount(parent.id),
    connectionArgs,
    {
      resolveInfo: info,
      getCursor: (item) => item.cursor,
      encodeCursor: likeCursor,
      itemToEdge: (item) => ({
        node: item.post,
        likedAt: item.cursor.createdAt,
      }),
    },
  );
};

const parseArgs = (args: UserLikesArgs) => {
  const connectionArgs = parseConnectionArgs(args, {
    firstMax: FIRST_MAX,
    lastMax: LAST_MAX,
    parseCursor: parseLikeCursor,
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
