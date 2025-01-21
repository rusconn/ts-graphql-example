import DataLoader from "dataloader";
import type { Kysely } from "kysely";
import type { SetNonNullable } from "type-fest";

import type { DB } from "../../db/generated/types.ts";
import type { Post } from "../../db/models/post.ts";

export type Key = Post["id"];

export type Params = Pagination;

type Pagination = {
  cursor?: Post["id"];
  limit: number;
  reverse: boolean;
};

export const initClosure = (db: Kysely<DB>) => {
  let sharedParams: Params | undefined;

  const batchGet = async (keys: readonly Key[]) => {
    const { cursor, limit, reverse } = sharedParams!;

    const [direction, comp] = reverse //
      ? (["desc", "<"] as const)
      : (["asc", ">"] as const);

    // 本当は各 key に対する select limit を union all したいが、
    // kysely が集合演算を正しく実装していないようなので別の方法で実現した。
    // クエリの効率は悪いが、全件取得後にオンメモリで limit するよりマシ。
    const replies = await db
      .with("results", (db) =>
        db
          .selectFrom("Post")
          .where("parentId", "in", keys)
          .$if(cursor != null, (qb) => qb.where("id", comp, cursor!))
          .selectAll()
          .select(({ fn }) =>
            fn
              .agg<number>("row_number")
              .over((ob) =>
                ob //
                  .partitionBy("parentId")
                  .orderBy("id", direction),
              )
              .as("nth"),
          ),
      )
      .selectFrom("results")
      .where("nth", "<=", limit)
      .select([
        //
        "id",
        "updatedAt",
        "content",
        "status",
        "userId",
        "parentId",
      ])
      .orderBy("nth", "asc")
      .execute();

    // SetNonNullable: parentId が NULL のレコードは返されない
    // 順序は維持してくれるみたい
    const postReplies = Map.groupBy(
      replies as SetNonNullable<Post, "parentId">[],
      (reply) => reply.parentId,
    );

    const kv = new Map(postReplies.entries().map(([key, value]) => [key, value.slice(0, limit)]));

    return keys.map((key) => kv.get(key) ?? []);
  };

  const loader = new DataLoader(batchGet);

  return (params: Params) => {
    sharedParams ??= params;
    return loader;
  };
};
