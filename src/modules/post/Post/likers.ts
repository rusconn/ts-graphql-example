import { getCursorConnection } from "../../../lib/graphql/cursorConnections/get.ts";
import { cursorConnection } from "../../../lib/graphql/cursorConnections/sdl.ts";
import { LikerSortKeys, type PostLikersArgs, type PostResolvers } from "../../../schema.ts";
import { badUserInputErr } from "../../common/errors/badUserInput.ts";
import { parseConnectionArgs } from "../../common/parsers/connectionArgs.ts";
import { parseUserCursor } from "../../user/parsers/cursor.ts";
import * as likeId from "../internal/likeId.ts";

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
        .innerJoin("Like", "User.id", "Like.userId")
        .where("Like.postId", "=", parent.id)
        .$if(cursor != null, (qb) => qb.where(({ eb }) => eb("Like.id", comp, cursor!.id)))
        .selectAll("User")
        .select("Like.id as lid")
        .orderBy("lid", direction)
        .limit(limit)
        .execute();

      return backward ? page.reverse() : page;
    },
    () =>
      context.db
        .selectFrom("Like")
        .where("postId", "=", parent.id)
        .select(({ fn }) => fn.countAll().as("count"))
        .executeTakeFirstOrThrow()
        .then((result) => Number(result.count)),
    { first, after, last, before },
    {
      resolveInfo: info,
      getCursor: (record) => ({ id: record.lid }),
      recordToEdge: (record) => ({
        node: record,
        likedAt: likeId.date(record.lid),
      }),
    },
  );

  if (connection instanceof Error) {
    throw connection;
  }

  return connection;
};

const parseArgs = (args: PostLikersArgs) => {
  const connectionArgs = parseConnectionArgs(args, {
    firstMax: FIRST_MAX,
    lastMax: LAST_MAX,
    parseCursor: parseUserCursor,
  });

  if (connectionArgs instanceof Error) {
    return connectionArgs;
  }

  return {
    ...connectionArgs,
    reverse: args.reverse,
    sortKey: args.sortKey,
  };
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
