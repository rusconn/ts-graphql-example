import { getCursorConnection } from "../../lib/graphql/cursorConnections/get.ts";
import type { UserResolvers, UserTodosArgs } from "../../schema.ts";
import { TodoSortKeys } from "../../schema.ts";
import type { Todo } from "../Todo/_mapper.ts";
import { authAdminOrUserOwner } from "../_authorizers/user/adminOrUserOwner.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { parseConnectionArgs } from "../_parsers/connectionArgs.ts";
import { parseTodoCursor } from "../_parsers/todo/cursor.ts";
import { parseTodoStatus } from "../_parsers/todo/status.ts";

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
    ): TodoConnection
  }

  enum TodoSortKeys {
    CREATED_AT
    UPDATED_AT
  }

  type TodoConnection {
    pageInfo: PageInfo!
    edges: [TodoEdge]
    nodes: [Todo]
    totalCount: Int
  }

  type TodoEdge {
    cursor: String!
    node: Todo
  }
`;

export const resolver: UserResolvers["todos"] = async (parent, args, context, info) => {
  const authed = authAdminOrUserOwner(context, parent);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { first, after, last, before, reverse, sortKey, status } = parsed;

  const connection = await getCursorConnection<Todo, Pick<Todo, "id">>(
    async ({ cursor, limit, backward }) => {
      const page = await context.api.user.loadTodoPage(parent.id, {
        cursor: cursor?.id,
        sortKey: {
          [TodoSortKeys.CreatedAt]: "createdAt" as const,
          [TodoSortKeys.UpdatedAt]: "updatedAt" as const,
        }[sortKey],
        limit,
        reverse: reverse !== backward,
        status,
      });

      return backward ? page.reverse() : page;
    },
    () => context.api.user.loadTodoCount(parent.id, { status }),
    { first, after, last, before },
    { resolveInfo: info },
  );

  if (connection instanceof Error) {
    throw connection;
  }

  return connection;
};

const parseArgs = (args: UserTodosArgs) => {
  const connectionArgs = parseConnectionArgs(args, {
    firstMax: FIRST_MAX,
    lastMax: LAST_MAX,
    parseCursor: parseTodoCursor,
  });

  if (connectionArgs instanceof Error) {
    return connectionArgs;
  }

  const status = parseTodoStatus(args, {
    optional: true,
    nullable: false,
  });

  if (status instanceof Error) {
    return status;
  }

  return {
    ...connectionArgs,
    reverse: args.reverse,
    sortKey: args.sortKey,
    status,
  };
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const valids = [{ first: 10 }, { last: 10 }, { first: FIRST_MAX }, { last: LAST_MAX }];

    const invalids = [
      { first: 10, status: null },
      { first: FIRST_MAX + 1 },
      { last: LAST_MAX + 1 },
    ];

    const reverse = true;
    const sortKey = TodoSortKeys.UpdatedAt;

    test.each(valids)("valids %#", (args) => {
      const parsed = parseArgs({ ...args, reverse, sortKey });
      expect(parsed instanceof Error).toBe(false);
    });

    test.each(invalids)("invalids %#", (args) => {
      const parsed = parseArgs({ ...args, reverse, sortKey });
      expect(parsed instanceof Error).toBe(true);
    });
  });
}
