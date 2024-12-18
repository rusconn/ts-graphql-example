import {
  LikerOrderField,
  OrderDirection,
  type PostLikersArgs,
  type PostResolvers,
} from "../../../schema.ts";
import { auth } from "../../common/authorizers.ts";
import { getCursorConnections } from "../../common/cursor.ts";
import { parseErr } from "../../common/parsers.ts";
import { cursorConnections } from "../../common/typeDefs.ts";
import { parseUserNodeId } from "../../user/common/parser.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type Post {
    likers(
      "max: ${FIRST_MAX}"
      first: Int
      after: String
      "max: ${LAST_MAX}"
      last: Int
      before: String
      orderBy: LikerOrder! = { field: LIKED_AT, direction: DESC }
    ): LikerConnection
  }

  input LikerOrder {
    field: LikerOrderField!
    direction: OrderDirection!
  }

  enum LikerOrderField {
    LIKED_AT
  }

  ${cursorConnections({
    nodeType: "User",
    edgeType: "Liker",
    additionals: {
      connectionFields: {
        totalCount: "Int",
      },
      edgeFields: {
        likedAt: "DateTime",
      },
    },
  })}
`;

export const resolver: PostResolvers["likers"] = async (_parent, args, context, info) => {
  auth(context);

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
        [LikerOrderField.LikedAt]: "id" as const,
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
    { resolveInfo: info }, // TODO: likedAt を付加する
  );
};

const parseArgs = (args: PostLikersArgs) => {
  const { first, after, last, before, ...rest } = args;

  if (after) {
    parseUserNodeId(after); // TODO: main で漏れているかの確認、必要なら修正
  }
  if (before) {
    parseUserNodeId(before);
  }
  if (first && first > FIRST_MAX) {
    throw parseErr(`"first" must be up to ${FIRST_MAX}`);
  }
  if (last && last > LAST_MAX) {
    throw parseErr(`"last" must be up to ${LAST_MAX}`);
  }

  return { first, after, last, before, ...rest };
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../../schema.ts");

  describe("Parsing", () => {
    const valids = [{ first: 10 }, { last: 10 }, { first: FIRST_MAX }, { last: LAST_MAX }];

    const invalids = [{ first: FIRST_MAX + 1 }, { last: LAST_MAX + 1 }];

    const orderBy = {
      field: LikerOrderField.LikedAt,
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
