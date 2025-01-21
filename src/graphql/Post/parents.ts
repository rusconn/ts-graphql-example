import { getCursorConnection } from "../../lib/graphql/cursorConnections/get.ts";
import type { Post } from "../../models/post.ts";
import type { PostParentsArgs, PostResolvers } from "../../schema.ts";
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
    ): PostParentConnection @semanticNonNull
  }

  enum PostParentSortKeys {
    CREATED_AT
  }

  type PostParentConnection {
    pageInfo: PageInfo!
    edges: [PostParentEdge] @semanticNonNull(levels: [0, 1])
    nodes: [Post] @semanticNonNull(levels: [0, 1])
    totalCount: Int @semanticNonNull
  }

  type PostParentEdge {
    cursor: String!
    node: Post @semanticNonNull
  }
`;

export const resolver: PostResolvers["parents"] = async (parent, args, context, info) => {
  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { connectionArgs, reverse } = parsed;

  return await getCursorConnection<Post, Post["id"]>(
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

      if (reverse) {
        parentsInclusive.shift();
      } else {
        parentsInclusive.pop();
      }

      return parentsInclusive as (Post & { n: number })[];
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
    connectionArgs,
    { resolveInfo: info },
  );
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
    connectionArgs,
    reverse: args.reverse,
    sortKey: args.sortKey,
  };
};
