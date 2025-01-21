import type { Blocking } from "../../datasources/user.ts";
import { getCursorConnection } from "../../lib/graphql/cursorConnections/get.ts";
import type { Block } from "../../models/block.ts";
import type { User } from "../../models/user.ts";
import type { UserBlockingsArgs, UserResolvers } from "../../schema.ts";
import { blockCursor } from "../_adapters/block/cursor.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { parseBlockCursor } from "../_parsers/block/cursor.ts";
import { parseConnectionArgs } from "../_parsers/connectionArgs.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type User {
    blockings(
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

      sortKey: BlockingSortKeys! = BLOCKED_AT
    ): BlockingConnection @semanticNonNull
  }

  enum BlockingSortKeys {
    BLOCKED_AT
  }

  type BlockingConnection {
    pageInfo: PageInfo!
    edges: [BlockingEdge] @semanticNonNull(levels: [0, 1])
    nodes: [User] @semanticNonNull(levels: [0, 1])
    totalCount: Int @semanticNonNull
  }

  type BlockingEdge {
    cursor: String!
    node: User @semanticNonNull
    blockedAt: DateTime @semanticNonNull
  }
`;

export const resolver: UserResolvers["blockings"] = async (parent, args, context, info) => {
  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { connectionArgs, reverse } = parsed;

  return await getCursorConnection<Blocking, Block, User>(
    ({ backward, ...exceptBackward }) =>
      context.api.user.loadBlockingPage({
        blockerId: parent.id,
        reverse: reverse !== backward,
        ...exceptBackward,
      }),
    () => context.api.user.loadBlockingCount(parent.id),
    connectionArgs,
    {
      resolveInfo: info,
      getCursor: (item) => item.cursor,
      encodeCursor: blockCursor,
      itemToEdge: (item) => ({
        node: item.user,
        blockedAt: item.cursor.createdAt,
      }),
    },
  );
};

const parseArgs = (args: UserBlockingsArgs) => {
  const connectionArgs = parseConnectionArgs(args, {
    firstMax: FIRST_MAX,
    lastMax: LAST_MAX,
    parseCursor: parseBlockCursor,
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
