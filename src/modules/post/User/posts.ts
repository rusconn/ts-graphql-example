import {
  OrderDirection,
  UserPostOrderField,
  type UserPostsArgs,
  type UserResolvers,
} from "../../../schema.ts";
import { getCursorConnections } from "../../common/cursor.ts";
import { parseCursor, parseErr } from "../../common/parsers.ts";
import { cursorConnections } from "../../common/typeDefs.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type User {
    posts(
      "max: ${FIRST_MAX}"
      first: Int
      after: String
      "max: ${LAST_MAX}"
      last: Int
      before: String
      orderBy: UserPostOrder! = { field: CREATED_AT, direction: DESC }
    ): PostConnection
  }

  input UserPostOrder {
    field: UserPostOrderField!
    direction: OrderDirection!
  }

  enum UserPostOrderField {
    CREATED_AT
    UPDATED_AT
  }

  ${cursorConnections({
    nodeType: "Post",
    additionals: {
      connectionFields: {
        totalCount: "Int",
      },
    },
  })}
`;

export const resolver: UserResolvers["posts"] = async (parent, args, context, info) => {
  const { first, after, last, before, orderBy } = parseArgs(args);

  const connections = await getCursorConnections(
    async ({ cursor, limit, backward }) => {
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
        [UserPostOrderField.CreatedAt]: "id" as const,
        [UserPostOrderField.UpdatedAt]: "updatedAt" as const,
      }[orderBy.field];

      const cursorRecord = cursor
        ? context.db.selectFrom("Post").where("id", "=", cursor.id)
        : undefined;

      const result = await context.db
        .selectFrom("Post")
        .where("userId", "=", parent.id)
        .$if(cursorRecord != null, (qb) =>
          qb.where(({ eb }) =>
            eb.or([
              eb(orderColumn, comp, cursorRecord!.select(orderColumn)),
              eb.and([
                eb(orderColumn, "=", cursorRecord!.select(orderColumn)),
                eb("id", comp, cursorRecord!.select("id")),
              ]),
            ]),
          ),
        )
        .selectAll()
        .orderBy(orderColumn, direction)
        .orderBy("id", direction)
        .limit(limit)
        .execute();

      return backward ? result.reverse() : result;
    },
    () =>
      context.db
        .selectFrom("LikerPost")
        .where("userId", "=", parent.id)
        .select(({ fn }) => fn.countAll().as("count"))
        .executeTakeFirstOrThrow()
        .then((result) => Number(result.count)),
    { first, after, last, before },
    { resolveInfo: info },
  );

  return connections;
};

const parseArgs = (args: UserPostsArgs) => {
  const { first, after, last, before, ...rest } = args;

  if (first && first > FIRST_MAX) {
    throw parseErr(`"first" must be up to ${FIRST_MAX}`);
  }
  if (last && last > LAST_MAX) {
    throw parseErr(`"last" must be up to ${LAST_MAX}`);
  }

  return {
    first,
    after: after != null ? parseCursor(after) : null,
    last,
    before: before != null ? parseCursor(before) : null,
    ...rest,
  };
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../../schema.ts");

  describe("Parsing", () => {
    const valids = [{ first: 10 }, { last: 10 }, { first: FIRST_MAX }, { last: LAST_MAX }];

    const invalids = [{ first: FIRST_MAX + 1 }, { last: LAST_MAX + 1 }];

    const orderBy = {
      field: UserPostOrderField.CreatedAt,
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
