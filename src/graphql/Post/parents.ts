import type { Post } from "../../db/models/post.ts";
import { getCursorConnection } from "../../lib/graphql/cursorConnections/get.ts";
import { PostParentSortKeys, type PostParentsArgs, type PostResolvers } from "../../schema.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { parseConnectionArgs } from "../_parsers/connectionArgs.ts";
import { parsePostCursor } from "../_parsers/post/cursor.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type Post {
    parents(
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

      sortKey: PostParentSortKeys! = CREATED_AT
    ): PostParentConnection
  }

  enum PostParentSortKeys {
    CREATED_AT
  }

  type PostParentConnection {
    pageInfo: PageInfo!
    edges: [PostParentEdge]
    nodes: [Post]
    totalCount: Int
  }

  type PostParentEdge {
    cursor: String!
    node: Post
  }
`;

export const resolver: PostResolvers["parents"] = async (parent, args, context, info) => {
  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { first, after, last, before, reverse } = parsed;

  const connection = await getCursorConnection<Post, Post["id"]>(
    async ({ cursor, limit, backward }) => {
      const parentsInclusive = await context.db
        .withRecursive("replies", (db) =>
          db
            .selectFrom("Post")
            .where("id", "=", cursor ?? parent.id)
            .selectAll()
            .select((eb) => eb.cast<number>(eb.val(1), "integer").as("n"))
            .unionAll(
              db
                .selectFrom("Post")
                .innerJoin("replies", "Post.id", "replies.parentId")
                .where("replies.n", "<=", limit)
                .selectAll("Post")
                .select((eb) => eb("replies.n", "+", 1).as("n")),
            ),
        )
        .selectFrom("replies")
        .selectAll()
        .orderBy("id", reverse !== backward ? "desc" : "asc")
        .execute();

      if (backward) {
        parentsInclusive.reverse();
      }
      if (reverse) {
        parentsInclusive.shift();
      } else {
        parentsInclusive.pop();
      }

      // @ts-expect-error なんで？
      return parentsInclusive as Post[];
    },
    async () => {
      const parentsInclusive = await context.db
        .withRecursive("replies", (db) =>
          db
            .selectFrom("Post")
            .where("id", "=", parent.id)
            .select(["id", "parentId"])
            .unionAll(
              db
                .selectFrom("Post")
                .innerJoin("replies", "Post.id", "replies.parentId")
                .select(["Post.id", "Post.parentId"]),
            ),
        )
        .selectFrom("replies")
        .selectAll()
        .execute();

      return parentsInclusive.length - 1;
    },
    { first, after, last, before },
    { resolveInfo: info },
  );

  if (connection instanceof Error) {
    throw connection;
  }

  return connection;
};

const parseArgs = (args: PostParentsArgs) => {
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
    const sortKey = PostParentSortKeys.CreatedAt;

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
