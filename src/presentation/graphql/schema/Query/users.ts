import { getCursorConnection } from "../../../../lib/graphql/cursor-connections/mod.ts";
import { authAdmin } from "../_authorizers/admin.ts";
import { badUserInputError } from "../_errors/global/bad-user-input.ts";
import { forbiddenError } from "../_errors/global/forbidden.ts";
import { parseConnectionArgs } from "../_parsers/connection-args.ts";
import { parseUserCursor } from "../_parsers/user/cursor.ts";
import type { QueryResolvers, QueryUsersArgs } from "../_types.ts";
import { UserSortKeys } from "../_types.ts";

export const FIRST_MAX = 30;
export const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type Query {
    users(
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

      sortKey: UserSortKeys! = CREATED_AT
    ): UserConnection @semanticNonNull @complexity(value: 3, multipliers: ["first", "last"])
  }

  enum UserSortKeys {
    CREATED_AT
    UPDATED_AT
  }

  type UserConnection {
    pageInfo: PageInfo!
    edges: [UserEdge] @semanticNonNull(levels: [0, 1])
    nodes: [User] @semanticNonNull(levels: [0, 1])
    totalCount: Int @semanticNonNull @complexity(value: 5)
  }

  type UserEdge {
    cursor: String!
    node: User @semanticNonNull
  }
`;

export const resolver: QueryResolvers["users"] = async (_parent, args, context, info) => {
  const ctx = authAdmin(context);
  if (Error.isError(ctx)) {
    throw forbiddenError(ctx);
  }

  const parsed = parseArgs(args);
  if (Error.isError(parsed)) {
    throw badUserInputError(parsed.message, parsed);
  }

  const { connectionArgs, reverse, sortKey } = parsed;

  return await getCursorConnection(
    ({ backward, ...exceptBackward }) =>
      ctx.queries.user.findMany({
        sortKey,
        reverse: reverse !== backward,
        ...exceptBackward,
      }),
    () => ctx.queries.user.count(),
    connectionArgs,
    { resolveInfo: info! },
  );
};

const parseArgs = (args: QueryUsersArgs) => {
  const connectionArgs = parseConnectionArgs(args, {
    firstMax: FIRST_MAX,
    lastMax: LAST_MAX,
    parseCursor: parseUserCursor,
  });
  if (Error.isError(connectionArgs)) {
    return connectionArgs;
  }

  return {
    connectionArgs,
    reverse: args.reverse,
    sortKey: {
      [UserSortKeys.CreatedAt]: "createdAt" as const,
      [UserSortKeys.UpdatedAt]: "updatedAt" as const,
    }[args.sortKey],
  };
};
