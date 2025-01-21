import type { Liker } from "../../datasources/user.ts";
import { getCursorConnection } from "../../lib/graphql/cursorConnections/get.ts";
import type { Like } from "../../models/like.ts";
import type { User } from "../../models/user.ts";
import type { PostLikersArgs, PostResolvers } from "../../schema.ts";
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
    ): LikerConnection @semanticNonNull
  }

  enum LikerSortKeys {
    LIKED_AT
  }

  type LikerConnection {
    pageInfo: PageInfo!
    edges: [LikerEdge] @semanticNonNull(levels: [0, 1])
    nodes: [User] @semanticNonNull(levels: [0, 1])
    totalCount: Int @semanticNonNull
  }

  type LikerEdge {
    cursor: String!
    node: User @semanticNonNull
    likedAt: DateTime @semanticNonNull
  }
`;

export const resolver: PostResolvers["likers"] = async (parent, args, context, info) => {
  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { connectionArgs, reverse } = parsed;

  return await getCursorConnection<Liker, Like, User>(
    ({ backward, ...exceptBackward }) =>
      context.api.user.loadLikerPage({
        postId: parent.id,
        reverse: reverse !== backward,
        ...exceptBackward,
      }),
    () => context.api.like.loadCountByPostId(parent.id),
    connectionArgs,
    {
      resolveInfo: info,
      getCursor: (item) => item.cursor,
      encodeCursor: likeCursor,
      itemToEdge: (item) => ({
        node: item.user,
        likedAt: item.cursor.createdAt,
      }),
    },
  );
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
    connectionArgs,
    reverse: args.reverse,
    sortKey: args.sortKey,
  };
};
