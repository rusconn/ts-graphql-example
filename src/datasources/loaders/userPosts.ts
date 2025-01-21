import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/types.ts";
import { sortGroup } from "../../lib/dataloader/sortGroup.ts";
import type { Post } from "../../models/post.ts";

export type Key = {
  authorId: Post["authorId"];
  sortKey: "createdAt" | "updatedAt";
  reverse: boolean;
  cursor?: Post["id"];
  limit: number;
};

export const init = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db), { cacheKeyFn: JSON.stringify });
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const authorIds = keys.map((key) => key.authorId);
  const { sortKey, reverse, cursor, limit } = keys.at(0)!;

  const orderColumn = sortKey === "createdAt" ? "id" : sortKey;

  const [direction, comp] = reverse
    ? (["desc", "<"] as const) //
    : (["asc", ">"] as const);

  const cursorOrderColumn =
    cursor &&
    db
      .selectFrom("Post") //
      .where("id", "=", cursor)
      .select(orderColumn);

  const posts = await db
    .selectFrom("User")
    .innerJoinLateral(
      (eb) =>
        eb
          .selectFrom("Post")
          .whereRef("User.id", "=", "Post.authorId")
          .$if(cursor != null, (qb) =>
            qb.where(({ eb, refTuple, tuple }) =>
              eb(
                refTuple(orderColumn, "id"), //
                comp,
                tuple(cursorOrderColumn!, cursor!),
              ),
            ),
          )
          .selectAll("Post")
          .orderBy(orderColumn, direction)
          .orderBy("id", direction)
          .limit(limit)
          .as("posts"),
      (join) => join.onTrue(),
    )
    .where("User.id", "in", authorIds)
    .selectAll("posts")
    // サブクエリの結果順を維持することを想定して order by は指定していない
    .execute();

  return sortGroup(authorIds, posts as Post[], (post) => post.authorId);
};
