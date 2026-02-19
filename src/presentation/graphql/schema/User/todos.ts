import { getCursorConnection } from "../../../../lib/graphql/cursor-connections/mod.ts";
import { authAdminOrUserOwner } from "../_authorizers/user/admin-or-owner.ts";
import { badUserInputError } from "../_errors/global/bad-user-input.ts";
import { forbiddenError } from "../_errors/global/forbidden.ts";
import { parseConnectionArgs } from "../_parsers/connection-args.ts";
import { parseTodoCursor } from "../_parsers/todo/cursor.ts";
import { TodoSortKeys, TodoStatus, type UserResolvers, type UserTodosArgs } from "../_types.ts";

const FIRST_MAX = 50;
const LAST_MAX = 50;

export const typeDef = /* GraphQL */ `
  extend type User {
    todos(
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

      sortKey: TodoSortKeys! = UPDATED_AT

      """
      指定すると絞り込む、null は入力エラー
      """
      status: TodoStatus
    ): TodoConnection @semanticNonNull @complexity(value: 3, multipliers: ["first", "last"])
  }

  enum TodoSortKeys {
    CREATED_AT
    UPDATED_AT
  }

  type TodoConnection {
    pageInfo: PageInfo!
    edges: [TodoEdge] @semanticNonNull(levels: [0, 1])
    nodes: [Todo] @semanticNonNull(levels: [0, 1])
    totalCount: Int @semanticNonNull @complexity(value: 5)
  }

  type TodoEdge {
    cursor: String!
    node: Todo @semanticNonNull
  }
`;

export const resolver: NonNullable<UserResolvers["todos"]> = async (
  parent,
  args,
  context,
  info,
) => {
  const ctx = authAdminOrUserOwner(context, parent);
  if (Error.isError(ctx)) {
    throw forbiddenError(ctx);
  }

  const parsed = parseArgs(args);
  if (Error.isError(parsed)) {
    throw badUserInputError(parsed.message, parsed);
  }

  const { connectionArgs, reverse, sortKey, filter } = parsed;

  return await getCursorConnection(
    ({ backward, ...exceptBackward }) =>
      ctx.queries.todo.loadTheirPage({
        userId: parent.id,
        sortKey,
        reverse: reverse !== backward,
        ...exceptBackward,
        ...filter,
      }),
    () =>
      ctx.queries.todo.loadTheirCount({
        userId: parent.id,
        ...filter,
      }),
    connectionArgs,
    { resolveInfo: info! },
  );
};

const parseArgs = (args: UserTodosArgs) => {
  const connectionArgs = parseConnectionArgs(args, {
    firstMax: FIRST_MAX,
    lastMax: LAST_MAX,
    parseCursor: parseTodoCursor,
  });
  if (Error.isError(connectionArgs)) {
    return connectionArgs;
  }

  return {
    connectionArgs,
    reverse: args.reverse,
    sortKey: {
      [TodoSortKeys.CreatedAt]: "createdAt" as const,
      [TodoSortKeys.UpdatedAt]: "updatedAt" as const,
    }[args.sortKey],
    filter: {
      ...(args.status != null && {
        status: {
          [TodoStatus.Done]: "done" as const,
          [TodoStatus.Pending]: "pending" as const,
        }[args.status],
      }),
    },
  };
};
