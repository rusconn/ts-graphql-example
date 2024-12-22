import { cursorConnection, getCursorConnection } from "../../../lib/graphql/cursor.ts";
import type { UserResolvers, UserTodosArgs } from "../../../schema.ts";
import { TodoSortKeys } from "../../../schema.ts";
import { badUserInputErr } from "../../common/errors/badUserInput.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import { parseConnectionArgs } from "../../common/parsers/connectionArgs.ts";
import { authAdminOrUserOwner } from "../../user/authorizers/adminOrUserOwner.ts";
import { parseTodoCursor } from "../parsers/cursor.ts";
import { parseTodoStatus } from "../parsers/status.ts";

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

  ${cursorConnection({
    nodeType: "Todo",
    additionals: {
      connectionFields: {
        totalCount: "Int",
      },
    },
  })}
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

  const connection = await getCursorConnection(
    async ({ backward, ...rest }) => {
      const [direction, comp] =
        reverse === backward //
          ? (["asc", ">"] as const)
          : (["desc", "<"] as const);

      const orderColumn = {
        [TodoSortKeys.CreatedAt]: "id" as const,
        [TodoSortKeys.UpdatedAt]: "updatedAt" as const,
      }[sortKey];

      const page = await context.loaders
        .userTodos({ ...rest, orderColumn, direction, comp, status })
        .load(parent);

      return backward ? page.reverse() : page;
    },
    () => context.loaders.userTodosCount({ status }).load(parent),
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
