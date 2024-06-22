import { authAdmin } from "../../common/authorizers.ts";
import { getCursorConnections } from "../../common/cursor.ts";
import { parseErr } from "../../common/parsers.ts";
import type { QueryResolvers } from "../../common/schema.ts";
import { OrderDirection, UserOrderField } from "../../common/schema.ts";
import { cursorConnections, orderOptions } from "../../common/typeDefs.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type Query {
    users(
      "max: ${FIRST_MAX}"
      first: Int
      after: String
      "max: ${LAST_MAX}"
      last: Int
      before: String
      orderBy: UserOrder! = { field: CREATED_AT, direction: DESC }
    ): UserConnection
  }

  ${orderOptions("User")}
  ${cursorConnections("User", { totalCount: "Int" })}
`;

export const resolver: QueryResolvers["users"] = async (_parent, args, context, info) => {
  authAdmin(context);

  const { orderBy, first, after, last, before } = args;

  if (first && first > FIRST_MAX) {
    throw parseErr(`"first" must be up to ${FIRST_MAX}`);
  }
  if (last && last > LAST_MAX) {
    throw parseErr(`"last" must be up to ${LAST_MAX}`);
  }

  return await getCursorConnections(
    async ({ cursor, limit, offset, backward }) => {
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
        [UserOrderField.CreatedAt]: "id" as const,
        [UserOrderField.UpdatedAt]: "updatedAt" as const,
      }[orderBy.field];

      const cursorRecord = cursor
        ? context.db.selectFrom("User").where("id", "=", cursor.id)
        : undefined;

      return await context.db
        .selectFrom("User")
        .$if(cursorRecord != null, (qb) =>
          qb.where(({ eb }) =>
            eb.or([
              eb(orderColumn, columnComp, cursorRecord!.select(orderColumn)),
              eb.and([
                eb(orderColumn, "=", cursorRecord!.select(orderColumn)),
                eb("id", idComp, cursorRecord!.select("id")),
              ]),
            ]),
          ),
        )
        .orderBy(orderColumn, direction)
        .orderBy("id", direction)
        .$if(limit != null, (qb) => qb.limit(limit!))
        .$if(offset != null, (qb) => qb.offset(offset!))
        .selectAll()
        .execute()
        .then((result) => (backward ? result.reverse() : result));
    },
    () =>
      context.db
        .selectFrom("User")
        .select(({ fn }) => fn.countAll().as("count"))
        .executeTakeFirstOrThrow()
        .then((result) => Number(result.count)),
    { first, after, last, before },
    { resolveInfo: info },
  );
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../common/schema.ts");
  const { dummyContext } = await import("../../common/tests.ts");
  const { context } = await import("../../common/testData/mod.ts");

  type Args = Parameters<typeof resolver>[1];
  type Params = Parameters<typeof dummyContext>[0];

  const valid = {
    args: {
      first: 10,
      orderBy: {
        field: UserOrderField.CreatedAt,
        direction: OrderDirection.Desc,
      },
    },
    user: context.admin,
  };

  const resolve = ({
    args = valid.args,
    user = valid.user,
  }: {
    args?: Args;
    user?: Params["user"];
  }) => {
    return resolver({}, args, dummyContext({ user }));
  };

  describe("Parsing", () => {
    const valids = [{ first: 10 }, { last: 10 }, { first: FIRST_MAX }, { last: LAST_MAX }];

    const invalids = [{ first: FIRST_MAX + 1 }, { last: LAST_MAX + 1 }];

    const { orderBy } = valid.args;

    test.each(valids)("valids %#", async (args) => {
      await resolve({ args: { ...args, orderBy } });
    });

    test.each(invalids)("invalids %#", async (args) => {
      expect.assertions(1);
      try {
        await resolve({ args: { ...args, orderBy } });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.BadUserInput);
      }
    });
  });
}
