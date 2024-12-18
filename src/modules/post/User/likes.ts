import { LikeSortKeys, type UserLikesArgs, type UserResolvers } from "../../../schema.ts";
import { getCursorConnection } from "../../common/cursor.ts";
import { parseCursor, parseErr } from "../../common/parsers.ts";
import { badUserInputErr, dateByUuid } from "../../common/resolvers.ts";
import { cursorConnection } from "../../common/typeDefs.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type User {
    likes(
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

      reverse: Boolean! = true

      sortKey: LikeSortKeys! = LIKED_AT
    ): LikeConnection
  }

  enum LikeSortKeys {
    LIKED_AT
  }

  ${cursorConnection({
    nodeType: "Post",
    edgeType: "Like",
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

export const resolver: UserResolvers["likes"] = async (parent, args, context, info) => {
  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { first, after, last, before, reverse } = parsed;

  const connection = await getCursorConnection(
    async ({ cursor, limit, backward }) => {
      const [direction, comp] =
        reverse === backward //
          ? (["asc", ">"] as const)
          : (["desc", "<"] as const);

      const cursorRecord = cursor
        ? context.db.selectFrom("Post").where("id", "=", cursor.id)
        : undefined;

      const result = await context.db
        .selectFrom("Post")
        .innerJoin("LikerPost", "Post.id", "LikerPost.postId")
        .where("userId", "=", parent.id)
        .$if(cursorRecord != null, (qb) =>
          qb.where(({ eb }) => eb("id", comp, cursorRecord!.select("id"))),
        )
        .selectAll("Post")
        .select(["LikerPost.id as lpid"])
        .orderBy("lpid", direction)
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
    {
      resolveInfo: info,
      recordToEdge: (record) => ({
        node: record,
        likedAt: dateByUuid(record.lpid),
      }),
    },
  );

  if (connection instanceof Error) {
    throw connection;
  }

  return connection;
};

const parseArgs = (args: UserLikesArgs) => {
  const { first, after, last, before, ...rest } = args;

  if (first && first > FIRST_MAX) {
    return parseErr(`"first" must be up to ${FIRST_MAX}`);
  }
  if (last && last > LAST_MAX) {
    return parseErr(`"last" must be up to ${LAST_MAX}`);
  }

  const parsedAfter = after != null ? parseCursor(after) : null;
  const parsedBefore = before != null ? parseCursor(before) : null;

  if (parsedAfter instanceof Error) {
    return parsedAfter;
  }
  if (parsedBefore instanceof Error) {
    return parsedBefore;
  }

  return { first, after: parsedAfter, last, before: parsedBefore, ...rest };
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const valids = [{ first: 10 }, { last: 10 }, { first: FIRST_MAX }, { last: LAST_MAX }];

    const invalids = [{ first: FIRST_MAX + 1 }, { last: LAST_MAX + 1 }];

    const reverse = true;
    const sortKey = LikeSortKeys.LikedAt;

    test.each(valids)("valids %#", (args) => {
      const parsed = parseArgs({ ...args, reverse, sortKey });
      expect(parsed instanceof Error).toBe(false);
    });

    test.each(invalids)("invalids %#", (args) => {
      const parsed = parseArgs({ ...args, reverse, sortKey });
      expect(parsed instanceof Error).toBe(true);
    });
  });
}
