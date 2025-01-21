import type { Follower } from "../../datasources/user.ts";
import { getCursorConnection } from "../../lib/graphql/cursorConnections/get.ts";
import type { Follow } from "../../models/follow.ts";
import type { User } from "../../models/user.ts";
import type { UserFollowersArgs, UserResolvers } from "../../schema.ts";
import { followCursor } from "../_adapters/follow/cursor.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { parseConnectionArgs } from "../_parsers/connectionArgs.ts";
import { parseFollowCursor } from "../_parsers/follow/cursor.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type User {
    followers(
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

      sortKey: FollowerSortKeys! = FOLLOWED_AT
    ): FollowerConnection @semanticNonNull
  }

  enum FollowerSortKeys {
    FOLLOWED_AT
  }

  type FollowerConnection {
    pageInfo: PageInfo!
    edges: [FollowerEdge] @semanticNonNull(levels: [0, 1])
    nodes: [User] @semanticNonNull(levels: [0, 1])
    totalCount: Int @semanticNonNull
  }

  type FollowerEdge {
    cursor: String!
    node: User @semanticNonNull
    followedAt: DateTime @semanticNonNull
  }
`;

export const resolver: UserResolvers["followers"] = async (parent, args, context, info) => {
  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { connectionArgs, reverse } = parsed;

  return await getCursorConnection<Follower, Follow, User>(
    ({ backward, ...exceptBackward }) =>
      context.api.user.loadFollowerPage({
        followeeId: parent.id,
        reverse: reverse !== backward,
        ...exceptBackward,
      }),
    () => context.api.user.loadFollowerCount(parent.id),
    connectionArgs,
    {
      resolveInfo: info,
      getCursor: (item) => item.cursor,
      encodeCursor: followCursor,
      itemToEdge: (item) => ({
        node: item.user,
        followedAt: item.cursor.createdAt,
      }),
    },
  );
};

const parseArgs = (args: UserFollowersArgs) => {
  const connectionArgs = parseConnectionArgs(args, {
    firstMax: FIRST_MAX,
    lastMax: LAST_MAX,
    parseCursor: parseFollowCursor,
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
