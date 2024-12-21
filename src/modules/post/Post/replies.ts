import * as cursorConnections from "../../../lib/graphql/cursor.ts";
import { ReplySortKeys, type PostRepliesArgs, type PostResolvers } from "../../../schema.ts";
import { parseCursor, parseErr } from "../../common/parsers.ts";
import { badUserInputErr } from "../../common/resolvers.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type Post {
    replies(
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

      reverse: Boolean! = false

      sortKey: ReplySortKeys! = REPLIED_AT
    ): ReplyConnection
  }

  enum ReplySortKeys {
    REPLIED_AT
  }

  ${cursorConnections.define({
    nodeType: "Post",
    edgeType: "Reply",
    additionals: {
      connectionFields: {
        totalCount: "Int",
      },
    },
  })}
`;

export const resolver: PostResolvers["replies"] = async (parent, args, context, info) => {
  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { first, after, last, before, reverse } = parsed;

  const connection = await cursorConnections.get(
    async ({ cursor, limit, backward }) => {
      const [direction, comp] =
        reverse === backward //
          ? (["asc", ">"] as const)
          : (["desc", "<"] as const);

      const page = await context.db
        .selectFrom("Post")
        .where("parentId", "=", parent.id)
        .$if(cursor != null, (qb) => qb.where(({ eb }) => eb("id", comp, cursor!.id)))
        .selectAll()
        .orderBy("id", direction)
        .limit(limit)
        .execute();

      return backward ? page.reverse() : page;
    },
    () =>
      context.db
        .selectFrom("Post")
        .where("parentId", "=", parent.id)
        .select(({ fn }) => fn.countAll().as("count"))
        .executeTakeFirstOrThrow()
        .then((result) => Number(result.count)),
    { first, after, last, before },
    { resolveInfo: info },
  );

  if (connection instanceof Error) {
    throw connection;
  }

  return connection;
};

const parseArgs = (args: PostRepliesArgs) => {
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
    const sortKey = ReplySortKeys.RepliedAt;

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
