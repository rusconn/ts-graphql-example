import { getCursorConnection } from "../../../lib/cursor.ts";
import * as uuidv7 from "../../../lib/uuidv7.ts";
import { LikerSortKeys, type PostLikersArgs, type PostResolvers } from "../../../schema.ts";
import { parseCursor, parseErr } from "../../common/parsers.ts";
import { badUserInputErr } from "../../common/resolvers.ts";
import { cursorConnection } from "../../common/typeDefs.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type Post {
    likers(
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

      sortKey: LikerSortKeys! = LIKED_AT
    ): LikerConnection
  }

  enum LikerSortKeys {
    LIKED_AT
  }

  ${cursorConnection({
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

      const page = await context.db
        .selectFrom("User")
        .innerJoin("LikerPost", "User.id", "LikerPost.userId")
        .where("LikerPost.postId", "=", parent.id)
        .$if(cursor != null, (qb) => qb.where(({ eb }) => eb("LikerPost.id", comp, cursor!.id)))
        .selectAll("User")
        .select(["LikerPost.id as lpid"])
        .orderBy("lpid", direction)
        .limit(limit)
        .execute();

      return backward ? page.reverse() : page;
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
      getCursor: (record) => ({ id: record.lpid }),
      recordToEdge: (record) => ({
        node: record,
        likedAt: uuidv7.date(record.lpid),
      }),
    },
  );

  if (connection instanceof Error) {
    throw connection;
  }

  return connection;
};

const parseArgs = (args: PostLikersArgs) => {
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
    const sortKey = LikerSortKeys.LikedAt;

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
