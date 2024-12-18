import { PostSortKeys, type QueryPostsArgs, type QueryResolvers } from "../../../schema.ts";
import { getCursorConnection } from "../../common/cursor.ts";
import { parseCursor, parseErr } from "../../common/parsers.ts";
import { badUserInputErr } from "../../common/resolvers.ts";
import { cursorConnection } from "../../common/typeDefs.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type Query {
    posts(
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

      sortKey: PostSortKeys! = CREATED_AT
    ): PostConnection
  }

  enum PostSortKeys {
    CREATED_AT
    UPDATED_AT
  }

  ${cursorConnection({
    nodeType: "Post",
    additionals: {
      connectionFields: {
        totalCount: "Int",
      },
    },
  })}
`;

export const resolver: QueryResolvers["posts"] = async (_parent, args, context, info) => {
  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { first, after, last, before, reverse, sortKey } = parsed;

  const connection = await getCursorConnection(
    async ({ cursor, limit, backward }) => {
      const [direction, comp] =
        reverse === backward //
          ? (["asc", ">"] as const)
          : (["desc", "<"] as const);

      const orderColumn = {
        [PostSortKeys.CreatedAt]: "id" as const,
        [PostSortKeys.UpdatedAt]: "updatedAt" as const,
      }[sortKey];

      const cursorOrderColumn = cursor
        ? context.db //
            .selectFrom("Post")
            .where("id", "=", cursor.id)
            .select(orderColumn)
        : undefined;

      const page = await context.db
        .selectFrom("Post")
        .$if(cursorOrderColumn != null, (qb) =>
          qb.where(({ eb }) =>
            eb.or([
              eb(orderColumn, comp, cursorOrderColumn!),
              eb.and([
                //
                eb(orderColumn, "=", cursorOrderColumn!),
                eb("id", comp, cursor!.id),
              ]),
            ]),
          ),
        )
        .selectAll()
        .orderBy(orderColumn, direction)
        .orderBy("id", direction)
        .limit(limit)
        .execute();

      return backward ? page.reverse() : page;
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

  if (connection instanceof Error) {
    throw connection;
  }

  return connection;
};

const parseArgs = (args: QueryPostsArgs) => {
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
    const sortKey = PostSortKeys.CreatedAt;

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
