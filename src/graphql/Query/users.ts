import { getCursorConnection } from "../../lib/graphql/cursorConnections/get.ts";
import type { QueryResolvers, QueryUsersArgs } from "../../schema.ts";
import { UserSortKeys } from "../../schema.ts";
import type { User } from "../User/_mapper.ts";
import { authAdmin } from "../_authorizers/admin.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { connectionArgsSchema } from "../_parsers/connectionArgs.ts";
import { userCursorSchema } from "../_parsers/user/cursor.ts";

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

  const parseResult = parseArgs(args);

  if (!parseResult.success) {
    throw badUserInputErr("", parseResult.error);
  }

  const { connectionArgs, reverse, sortKey } = parseResult.data;

  return await getCursorConnection<User, User["id"]>(
    ({ cursor, limit, backward }) =>
      context.api.user.getPage({
        cursor,
        sortKey: {
          [UserSortKeys.CreatedAt]: "createdAt" as const,
          [UserSortKeys.UpdatedAt]: "updatedAt" as const,
        }[sortKey],
        limit,
        reverse: reverse !== backward,
      }),
    context.api.user.count,
    connectionArgs,
    { resolveInfo: info },
  );
};

const parseArgs = (args: QueryUsersArgs) => {
  const { reverse, sortKey, ...rest } = args;

  return connectionArgsSchema({
    firstMax: FIRST_MAX,
    lastMax: LAST_MAX,
    cursorSchema: userCursorSchema,
  })
    .transform((args) => ({
      connectionArgs: args,
      reverse,
      sortKey,
    }))
    .safeParse(rest);
};
