import type { UserLikedPostsArgs, UserResolvers } from "../../../schema.ts";
import { auth } from "../../common/authorizers.ts";
import { getCursorConnections } from "../../common/cursor.ts";
import { parseCursor, parseErr } from "../../common/parsers.ts";
import { dateByUuid } from "../../common/resolvers.ts";
import { cursorConnections } from "../../common/typeDefs.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type User {
    likedPosts(
      "max: ${FIRST_MAX}"
      first: Int
      after: String
      "max: ${LAST_MAX}"
      last: Int
      before: String
    ): LikedPostConnection
  }

  ${cursorConnections({
    nodeType: "Post",
    edgeType: "LikedPost",
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

export const resolver: UserResolvers["likedPosts"] = async (parent, args, context, info) => {
  auth(context);

  const { first, after, last, before } = parseArgs(args);

  const connections = await getCursorConnections(
    async ({ cursor, limit, offset, backward }) => {
      const [direction, comp] = backward //
        ? (["asc", ">"] as const)
        : (["desc", "<"] as const);

      const cursorRecord = cursor
        ? context.db //
            .selectFrom("Post")
            .where("id", "=", cursor.id)
            .where("userId", "=", parent.id)
        : undefined;

      return await context.db
        .selectFrom("Post as p")
        .innerJoin("LikerPost as lp", "p.id", "lp.postId")
        .where("userId", "=", parent.id)
        .$if(cursorRecord != null, (qb) =>
          qb.where(({ eb }) => eb("id", comp, cursorRecord!.select("id"))),
        )
        .select(["p.id", "lp.id", "p.updatedAt", "p.content", "p.userId", "p.parentId"])
        .orderBy("lp.id", direction)
        .$if(limit != null, (qb) => qb.limit(limit!))
        .$if(offset != null, (qb) => qb.offset(offset!))
        .execute()
        .then((result) => (backward ? result.reverse() : result));
    },
    () =>
      context.db
        .selectFrom("LikerPost")
        .where("userId", "=", parent.id)
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

const parseArgs = (args: UserLikedPostsArgs) => {
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
