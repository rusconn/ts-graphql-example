import type { Like } from "../../../db/models/like.ts";
import * as likeId from "../../../db/models/like/id.ts";
import type { Post } from "../../../db/models/post.ts";
import { getCursorConnection } from "../../../lib/graphql/cursorConnections/get.ts";
import { cursorConnection } from "../../../lib/graphql/cursorConnections/sdl.ts";
import { LikeSortKeys, type UserLikesArgs, type UserResolvers } from "../../../schema.ts";
import { badUserInputErr } from "../../common/errors/badUserInput.ts";
import { parseConnectionArgs } from "../../common/parsers/connectionArgs.ts";
import { parsePostCursor } from "../parsers/cursor.ts";

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

  const connection = await getCursorConnection<Post & { lid: Like["id"] }, Pick<Like, "id">>(
    async ({ cursor, limit, backward }) => {
      const page = await context.api.user.loadLikeds(parent.id, {
        cursor: cursor?.id,
        limit,
        reverse: reverse !== backward,
      });

      return backward ? page.reverse() : page;
    },
    () => context.api.user.loadLikeCount(parent.id),
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

const parseArgs = (args: UserLikesArgs) => {
  const connectionArgs = parseConnectionArgs(args, {
    firstMax: FIRST_MAX,
    lastMax: LAST_MAX,
    parseCursor: parsePostCursor,
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
