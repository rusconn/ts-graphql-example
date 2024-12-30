import type { Post } from "../../../db/models/post.ts";
import { getCursorConnection } from "../../../lib/graphql/cursorConnections/get.ts";
import { cursorConnection } from "../../../lib/graphql/cursorConnections/sdl.ts";
import {
  PossiblyDeletedPostSortKeys,
  type PostParentsArgs,
  type PostResolvers,
} from "../../../schema.ts";
import { badUserInputErr } from "../../common/errors/badUserInput.ts";
import { parseConnectionArgs } from "../../common/parsers/connectionArgs.ts";
import { parsePostCursor } from "../parsers/cursor.ts";

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

      sortKey: PossiblyDeletedPostSortKeys! = CREATED_AT
    ): PossiblyDeletedPostConnection
  }

  enum PossiblyDeletedPostSortKeys {
    CREATED_AT
  }

  ${cursorConnection({
    nodeType: "PossiblyDeletedPost",
    additionals: {
      connectionFields: {
        totalCount: "Int",
      },
    },
  })}

  union PossiblyDeletedPost = Post | DeletedPost

  # TODO: モジュールに分ける
  type DeletedPost {
    id: String! # TODO: ID!
  }
`;

export const resolver: PostResolvers["parents"] = async (parent, args, context, info) => {
  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { first, after, last, before, reverse } = parsed;

  type ExtendedPost = Post & { status: string } & { n: number };

  const connection = await getCursorConnection<ExtendedPost, Pick<Post, "id">>(
    async ({ cursor, limit, backward }) => {
      const parentsInclusive = await context.db
        .withRecursive("replies", (db) =>
          db
            .selectFrom("Post")
            .where("id", "=", cursor?.id ?? parent.id)
            .select((eb) => eb.cast<number>(eb.val(1), "integer").as("n"))
            .select((eb) => eb.val("active").as("status"))
            .selectAll()
            .unionAll(
              db
                .selectFrom("replies as rep")
                .leftJoin("Post as p", "p.id", "rep.parentId")
                .leftJoin("DeletedPost as dp", "dp.id", "rep.parentId")
                .where("rep.n", "<", limit)
                .where((eb) =>
                  eb.or([
                    //
                    eb("p.id", "is not", null),
                    eb("dp.id", "is not", null),
                  ]),
                )
                .select((eb) => eb("rep.n", "+", 1).as("n"))
                .select((eb) =>
                  eb
                    .case()
                    .when("p.id", "is not", null)
                    .then(eb.val("active"))
                    .else(eb.val("deleted"))
                    .end()
                    .as("status"),
                )
                .select((eb) =>
                  eb //
                    .case()
                    .when("p.id", "is not", null)
                    .then(eb.ref("p.id"))
                    .else(eb.ref("dp.id"))
                    .end(),
                )
                .select((eb) =>
                  eb //
                    .case()
                    .when("p.id", "is not", null)
                    .then(eb.ref("p.updatedAt"))
                    .else(eb.ref("dp.updatedAt"))
                    .end(),
                )
                .select((eb) =>
                  eb //
                    .case()
                    .when("p.id", "is not", null)
                    .then(eb.ref("p.content"))
                    .else(eb.ref("dp.content"))
                    .end(),
                )
                .select((eb) =>
                  eb //
                    .case()
                    .when("p.id", "is not", null)
                    .then(eb.ref("p.userId"))
                    .else(eb.ref("dp.userId"))
                    .end(),
                )
                .select((eb) =>
                  eb //
                    .case()
                    .when("p.id", "is not", null)
                    .then(eb.ref("p.parentId"))
                    .else(eb.ref("dp.parentId"))
                    .end(),
                ),
            ),
        )
        .selectFrom("replies")
        .selectAll()
        .orderBy("id", reverse ? "desc" : "asc")
        .execute();

      return parentsInclusive as ExtendedPost[];
    },
    async () => {
      return 0; // TODO: 実装
    },
    { first, after, last, before },
    {
      resolveInfo: info,
      recordToEdge: (record) => ({
        node: {
          __typename: record.status === "active" ? "Post" : "DeletedPost",
          ...record,
        },
      }),
    },
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
    const sortKey = PossiblyDeletedPostSortKeys.CreatedAt;

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
