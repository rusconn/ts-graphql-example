import type { UserResolvers, UserTodosArgs } from "../../../schema.ts";
import { OrderDirection, TodoOrderField } from "../../../schema.ts";
import { getCursorConnections } from "../../common/cursor.ts";
import { parseCursor, parseErr } from "../../common/parsers.ts";
import { cursorConnections } from "../../common/typeDefs.ts";
import { authAdminOrUserOwner } from "../../user/common/authorizer.ts";

const FIRST_MAX = 50;
const LAST_MAX = 50;

export const typeDef = /* GraphQL */ `
  extend type User {
    todos(
      "max: ${FIRST_MAX}"
      first: Int
      after: String
      "max: ${LAST_MAX}"
      last: Int
      before: String
      orderBy: TodoOrder! = { field: UPDATED_AT, direction: DESC }
      "指定すると絞り込む、null は入力エラー"
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

  ${cursorConnections({
    nodeType: "Todo",
    additionals: {
      connectionFields: {
        totalCount: "Int",
      },
    },
  })}
`;

export const resolver: UserResolvers["todos"] = async (parent, args, context, info) => {
  authAdminOrUserOwner(context, parent);

  const { orderBy, first, after, last, before, status } = parseArgs(args);

  return await getCursorConnections(
    async ({ backward, ...rest }) => {
      const [direction, columnComp, idComp] = {
        [OrderDirection.Asc]: ["asc", ">", ">="] as const,
        [OrderDirection.Desc]: ["desc", "<", "<="] as const,
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
        .userTodos({ ...rest, orderColumn, direction, columnComp, idComp, status })
        .load(parent)
        .then((result) => (backward ? result.reverse() : result));
    },
    () => context.loaders.userTodosCount({ status }).load(parent),
    { first, after, last, before },
    { resolveInfo: info },
  );
};

const parseArgs = (args: UserTodosArgs) => {
  const { first, after, last, before, status, ...rest } = args;

  if (first && first > FIRST_MAX) {
    throw parseErr(`"first" must be up to ${FIRST_MAX}`);
  }
  if (last && last > LAST_MAX) {
    throw parseErr(`"last" must be up to ${LAST_MAX}`);
  }
  if (status === null) {
    throw parseErr('"status" must be not null');
  }

  return {
    first,
    after: after != null ? parseCursor(after) : null,
    last,
    before: before != null ? parseCursor(before) : null,
    status,
    ...rest,
  };
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../../schema.ts");

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
      parseArgs({ ...args, orderBy });
    });

    test.each(invalids)("invalids %#", (args) => {
      expect.assertions(1);
      try {
        parseArgs({ ...args, orderBy });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.BadUserInput);
      }
    });
  });
}
