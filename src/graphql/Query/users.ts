import { getCursorConnection } from "../../lib/graphql/cursorConnections/get.ts";
import type { User } from "../../models/user.ts";
import type { QueryResolvers, QueryUsersArgs } from "../../schema.ts";
import { UserSortKeys } from "../../schema.ts";
import { userConnectionColumnsUnchecked } from "../User/_mapper.ts";
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
    ): UserConnection
  }

  enum UserSortKeys {
    CREATED_AT
    UPDATED_AT
  }

  type UserConnection {
    pageInfo: PageInfo!
    edges: [UserEdge]
    nodes: [User]
    totalCount: Int
  }

  type UserEdge {
    cursor: String!
    node: User
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

  return await getCursorConnection<User, User["id"]>(
    ({ backward, ...exceptBackward }) =>
      context.api.user.getPage({
        sortKey: {
          [UserSortKeys.CreatedAt]: "createdAt" as const,
          [UserSortKeys.UpdatedAt]: "updatedAt" as const,
        }[sortKey],
        reverse: reverse !== backward,
        ...exceptBackward,
        columns: userConnectionColumnsUnchecked(info),
      }),
    context.api.user.count,
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
