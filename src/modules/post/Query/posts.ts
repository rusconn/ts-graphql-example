import type { QueryPostsArgs, QueryResolvers } from "../../../schema.ts";
import { getCursorConnections } from "../../common/cursor.ts";
import { parseCursor, parseErr } from "../../common/parsers.ts";
import { cursorConnections } from "../../common/typeDefs.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type Query {
    posts(
      "max: ${FIRST_MAX}"
      first: Int
      after: String
      "max: ${LAST_MAX}"
      last: Int
      before: String
      orderBy: PostOrder! = { field: CREATED_AT, direction: DESC }
    ): PostConnection
  }

  input PostOrder {
    field: PostOrderField!
    direction: OrderDirection!
  }

  enum PostOrderField {
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

export const resolver: QueryResolvers["posts"] = async (_parent, args, context, info) => {
  const { first, after, last, before } = parseArgs(args);

  const connections = await getCursorConnections(
    async ({ cursor, limit, offset, backward }) => {
      const [direction, comp] = backward //
        ? (["asc", ">"] as const)
        : (["desc", "<"] as const);

      const cursorRecord = cursor
        ? context.db.selectFrom("Post").where("id", "=", cursor.id)
        : undefined;

      return await context.db
        .selectFrom("Post")
        .$if(cursorRecord != null, (qb) =>
          qb.where(({ eb }) => eb("id", comp, cursorRecord!.select("id"))),
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
        .selectFrom("Post")
        .select(({ fn }) => fn.countAll().as("count"))
        .executeTakeFirstOrThrow()
        .then((result) => Number(result.count)),
    { first, after, last, before },
    { resolveInfo: info },
  );

  return connections;
};

const parseArgs = (args: QueryPostsArgs) => {
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

    test.each(valids)("valids %#", (args) => {
      parseArgs(args);
    });

    test.each(invalids)("invalids %#", (args) => {
      expect.assertions(1);
      try {
        parseArgs(args);
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.BadUserInput);
      }
    });
  });
}
