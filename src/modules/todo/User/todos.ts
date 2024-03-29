import { getCursorConnections } from "../../common/cursor.ts";
import { parseErr } from "../../common/parsers.ts";
import type { UserResolvers } from "../../common/schema.ts";
import { OrderDirection, TodoOrderField } from "../../common/schema.ts";
import { cursorConnections, orderOptions } from "../../common/typeDefs.ts";
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
      "null 以外を指定すると絞り込む"
      status: TodoStatus
    ): TodoConnection
  }

  ${orderOptions("Todo")}
  ${cursorConnections("Todo", { totalCount: "Int" })}
`;

export const resolver: UserResolvers["todos"] = async (parent, args, context, info) => {
  authAdminOrUserOwner(context, parent);

  const { orderBy, first, after, last, before, status } = args;

  if (first && first > FIRST_MAX) {
    throw parseErr(`"first" must be up to ${FIRST_MAX}`);
  }
  if (last && last > LAST_MAX) {
    throw parseErr(`"last" must be up to ${LAST_MAX}`);
  }

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
        [TodoOrderField.CreatedAt]: "createdAt" as const,
        [TodoOrderField.UpdatedAt]: "updatedAt" as const,
      }[orderBy.field];

      return await context.loaders
        .userTodos({ ...rest, orderColumn, direction, columnComp, idComp, status })
        .load(parent)
        .then(result => (backward ? result.reverse() : result));
    },
    () => context.loaders.userTodosCount({ status }).load(parent),
    parseErr,
    { first, after, last, before },
    { resolveInfo: info },
  );
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../common/schema.ts");
  const { dummyContext } = await import("../../common/tests.ts");
  const { context, db } = await import("../../user/common/test.ts");

  type Parent = Parameters<typeof resolver>[0];
  type Args = Parameters<typeof resolver>[1];
  type Params = Parameters<typeof dummyContext>[0];

  const valid = {
    parent: db.admin,
    args: {
      first: 10,
      orderBy: {
        field: TodoOrderField.UpdatedAt,
        direction: OrderDirection.Desc,
      },
    },
    user: context.admin,
  };

  const resolve = ({
    parent = valid.parent,
    args = valid.args,
    user = valid.user,
  }: {
    parent?: Parent;
    args?: Args;
    user?: Params["user"];
  }) => {
    return resolver(parent, args, dummyContext({ user }));
  };

  describe("Authorization", () => {
    const allows = [
      [context.admin, db.admin],
      [context.admin, db.alice],
      [context.alice, db.alice],
    ] as const;

    const denies = [
      [context.alice, db.admin],
      [context.guest, db.admin],
      [context.guest, db.alice],
    ] as const;

    test.each(allows)("allows %#", async (user, parent) => {
      await resolve({ parent, user });
    });

    test.each(denies)("denies %#", async (user, parent) => {
      expect.assertions(1);
      try {
        await resolve({ parent, user });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.Forbidden);
      }
    });
  });

  describe("Parsing", () => {
    const valids = [{ first: 10 }, { last: 10 }, { first: FIRST_MAX }, { last: LAST_MAX }];

    const invalids = [{ first: FIRST_MAX + 1 }, { last: LAST_MAX + 1 }];

    const { orderBy } = valid.args;

    test.each(valids)("valids %#", async args => {
      await resolve({ args: { ...args, orderBy } });
    });

    test.each(invalids)("invalids %#", async args => {
      expect.assertions(1);
      try {
        await resolve({ args: { ...args, orderBy } });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.BadUserInput);
      }
    });
  });
}
