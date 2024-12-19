import {
  LikerOrderField,
  OrderDirection,
  type PostLikersArgs,
  type PostResolvers,
} from "../../../schema.ts";
import { auth } from "../../common/authorizers.ts";
import { getCursorConnections } from "../../common/cursor.ts";
import { parseCursor, parseErr } from "../../common/parsers.ts";
import { dateByUuid } from "../../common/resolvers.ts";
import { cursorConnections } from "../../common/typeDefs.ts";

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

export const resolver: PostResolvers["likers"] = async (parent, args, context, info) => {
  auth(context);

  const { first, after, last, before, orderBy } = parseArgs(args);

  const connections = await getCursorConnections(
    async ({ cursor, limit, offset, backward }) => {
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

      return await context.db
        .selectFrom("LikerPost")
        .innerJoin("User", "LikerPost.id", "User.id")
        .where("postId", "=", parent.id)
        .$if(cursor != null, (qb) =>
          qb.where(({ eb }) =>
            eb(
              "id",
              comp,
              context.db //
                .selectFrom("LikerPost")
                .where("postId", "=", cursor!.id)
                .select("id"),
            ),
          ),
        )
        .selectAll()
        .orderBy("id", direction)
        .$if(limit != null, (qb) => qb.limit(limit!))
        .$if(offset != null, (qb) => qb.offset(offset!))
        .execute()
        .then((result) => (backward ? result.reverse() : result));
    },
    () =>
      context.db
        .selectFrom("LikerPost")
        .where("postId", "=", parent.id)
        .select(({ fn }) => fn.countAll().as("count"))
        .executeTakeFirstOrThrow()
        .then((result) => Number(result.count)),
    { first, after, last, before },
    {
      resolveInfo: info,
      recordToEdge: (record) => ({
        node: record,
        likedAt: dateByUuid(record.id),
      }),
    },
  );

  return connections;
};

const parseArgs = (args: PostLikersArgs) => {
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
