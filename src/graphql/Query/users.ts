import type { UserBase } from "../../dto/user-base.ts";
import { getCursorConnection } from "../../lib/graphql/cursorConnections/get.ts";
import type { QueryResolvers, QueryUsersArgs } from "../../schema.ts";
import { UserSortKeys } from "../../schema.ts";
import { authAdmin } from "../_authorizers/admin.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { parseConnectionArgs } from "../_parsers/connectionArgs.ts";
import { parseUserCursor } from "../_parsers/user/cursor.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

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
  const authed = authAdmin(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { connectionArgs, reverse, sortKey } = parsed;

  return await getCursorConnection<UserBase, UserBase["id"]>(
    ({ backward, ...exceptBackward }) =>
      context.repos.user.findMany({
        sortKey: {
          [UserSortKeys.CreatedAt]: "createdAt" as const,
          [UserSortKeys.UpdatedAt]: "updatedAt" as const,
        }[sortKey],
        reverse: reverse !== backward,
        ...exceptBackward,
      }),
    () => context.repos.user.count(),
    connectionArgs,
    { resolveInfo: info },
  );
};

const parseArgs = (args: QueryUsersArgs) => {
  const connectionArgs = parseConnectionArgs(args, {
    firstMax: FIRST_MAX,
    lastMax: LAST_MAX,
    parseCursor: parseUserCursor,
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
