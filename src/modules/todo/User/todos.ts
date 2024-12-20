import type { UserResolvers, UserTodosArgs } from "../../../schema.ts";
import { OrderDirection, TodoOrderField } from "../../../schema.ts";
import { getCursorConnection } from "../../common/cursor.ts";
import { parseCursor, parseErr } from "../../common/parsers.ts";
import { badUserInputErr, forbiddenErr } from "../../common/resolvers.ts";
import { cursorConnection } from "../../common/typeDefs.ts";
import { authAdminOrUserOwner } from "../../user/common/authorizer.ts";

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

      orderBy: TodoOrder! = { field: UPDATED_AT, direction: DESC }

      """
      指定すると絞り込む、null は入力エラー
      """
      status: TodoStatus
    ): TodoConnection
  }

  input TodoOrder {
    field: TodoOrderField!
    direction: OrderDirection!
  }

  enum TodoOrderField {
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

  const { orderBy, first, after, last, before, status } = parsed;

  const connection = await getCursorConnection(
    async ({ backward, ...rest }) => {
      const [direction, comp] = {
        [OrderDirection.Asc]: ["asc", ">"] as const,
        [OrderDirection.Desc]: ["desc", "<"] as const,
      }[
        backward
          ? orderBy.direction === OrderDirection.Asc
            ? OrderDirection.Desc
            : OrderDirection.Asc
          : orderBy.direction
      ];

      const orderColumn = {
        [TodoOrderField.CreatedAt]: "id" as const,
        [TodoOrderField.UpdatedAt]: "updatedAt" as const,
      }[orderBy.field];

      return await context.loaders
        .userTodos({ ...rest, orderColumn, direction, comp, status })
        .load(parent)
        .then((result) => (backward ? result.reverse() : result));
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
  const { first, after, last, before, status, ...rest } = args;

  if (first && first > FIRST_MAX) {
    return parseErr(`"first" must be up to ${FIRST_MAX}`);
  }
  if (last && last > LAST_MAX) {
    return parseErr(`"last" must be up to ${LAST_MAX}`);
  }
  if (status === null) {
    return parseErr('"status" must be not null');
  }

  const parsedAfter = after != null ? parseCursor(after) : null;
  const parsedBefore = before != null ? parseCursor(before) : null;

  if (parsedAfter instanceof Error) {
    return parsedAfter;
  }
  if (parsedBefore instanceof Error) {
    return parsedBefore;
  }

  return { first, after: parsedAfter, last, before: parsedBefore, status, ...rest };
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const valids = [{ first: 10 }, { last: 10 }, { first: FIRST_MAX }, { last: LAST_MAX }];

    const invalids = [
      { first: 10, status: null },
      { first: FIRST_MAX + 1 },
      { last: LAST_MAX + 1 },
    ];

    const orderBy = {
      field: TodoOrderField.UpdatedAt,
      direction: OrderDirection.Desc,
    };

    test.each(valids)("valids %#", (args) => {
      const parsed = parseArgs({ ...args, orderBy });
      expect(parsed instanceof Error).toBe(false);
    });

    test.each(invalids)("invalids %#", (args) => {
      const parsed = parseArgs({ ...args, orderBy });
      expect(parsed instanceof Error).toBe(true);
    });
  });
}
