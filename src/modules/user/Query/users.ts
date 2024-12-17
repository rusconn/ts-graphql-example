import type { QueryResolvers, QueryUsersArgs } from "../../../schema.ts";
import { OrderDirection, UserOrderField } from "../../../schema.ts";
import { authAdmin } from "../../common/authorizers.ts";
import { getCursorConnections } from "../../common/cursor.ts";
import { parseErr } from "../../common/parsers.ts";
import { cursorConnections } from "../../common/typeDefs.ts";

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

  input UserOrder {
    field: UserOrderField!
    direction: OrderDirection!
  }

  enum UserOrderField {
    CREATED_AT
    UPDATED_AT
  }

  ${cursorConnections({
    nodeType: "User",
    additionals: {
      connectionFields: {
        totalCount: "Int",
      },
    },
  })}
`;

export const resolver: QueryResolvers["users"] = async (_parent, args, context, info) => {
  authAdmin(context);

  const { orderBy, first, after, last, before } = parseArgs(args);

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

const parseArgs = (args: QueryUsersArgs) => {
  const { first, last, ...rest } = args;

  if (first && first > FIRST_MAX) {
    throw parseErr(`"first" must be up to ${FIRST_MAX}`);
  }
  if (last && last > LAST_MAX) {
    throw parseErr(`"last" must be up to ${LAST_MAX}`);
  }

  return { first, last, ...rest };
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../../schema.ts");

  describe("Parsing", () => {
    const valids = [{ first: 10 }, { last: 10 }, { first: FIRST_MAX }, { last: LAST_MAX }];

    const invalids = [{ first: FIRST_MAX + 1 }, { last: LAST_MAX + 1 }];

    const orderBy = {
      field: UserOrderField.CreatedAt,
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
