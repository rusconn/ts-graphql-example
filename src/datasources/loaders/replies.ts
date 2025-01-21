import DataLoader from "dataloader";
import type { Kysely } from "kysely";
import type { SetNonNullable } from "type-fest";

import type { DB } from "../../db/types.ts";
import { sortGroup } from "../../lib/dataloader/sortGroup.ts";
import type { Post } from "../../models/post.ts";

export type Key = {
  postId: Post["id"];
  reverse: boolean;
  cursor?: Post["id"];
  limit: number;
};

export type Reply = SetNonNullable<Post, "parentId">;

export const init = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db), { cacheKeyFn: JSON.stringify });
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const postIds = keys.map((key) => key.postId);
  const { reverse, cursor, limit } = keys.at(0)!;

  const [direction, comp] = reverse
    ? (["desc", "<"] as const) //
    : (["asc", ">"] as const);

  const replies = await db
    .selectFrom("Post")
    .innerJoinLateral(
      (eb) =>
        eb
          .selectFrom("Post as p")
          .whereRef("Post.id", "=", "p.parentId")
          .$if(cursor != null, (qb) => qb.where("p.id", comp, cursor!))
          .selectAll("p")
          .orderBy("id", direction)
          .limit(limit)
          .as("replies"),
      (join) => join.onTrue(),
    )
    .where("Post.id", "in", postIds)
    .selectAll("replies")
    // サブクエリの結果順を維持することを想定して order by は指定していない
    .execute();

  return sortGroup(postIds, replies as Reply[], (reply) => reply.parentId!);
};
