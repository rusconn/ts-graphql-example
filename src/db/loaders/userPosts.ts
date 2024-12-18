import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { PostSelect, UserSelect } from "../models.ts";
import type { DB } from "../types.ts";

type Key = Pick<UserSelect, "id">;

type Params = Pagination;

type Pagination = {
  cursor?: Pick<PostSelect, "id">;
  limit: number;
  orderColumn: "id" | "updatedAt";
  direction: "asc" | "desc";
  comp: ">" | "<";
};

export const initClosure = (db: Kysely<DB>) => {
  let sharedParams: Params | undefined;

  const batchGet = async (keys: readonly Key[]) => {
    const { cursor, limit, orderColumn, direction, comp } = sharedParams!;

    const cursorRecord = cursor //
      ? db.selectFrom("Post").where("id", "=", cursor.id)
      : undefined;

    // 本当は各 key に対する select limit を union したいが、
    // kysely がサポートしていないようなので、全件取得した後オンメモリでそれぞれ limit する
    // この方法には結果セットが必要以上に大きくなり得るという問題がある
    // 即死も有り得る😱
    const posts = await db
      .selectFrom("Post")
      .where(
        "userId",
        "in",
        keys.map((key) => key.id),
      )
      .$if(cursorRecord != null, (qb) =>
        qb.where(({ eb }) =>
          eb.or([
            eb(orderColumn, comp, cursorRecord!.select(orderColumn)),
            eb.and([
              eb(orderColumn, "=", cursorRecord!.select(orderColumn)),
              eb("id", comp, cursorRecord!.select("id")),
            ]),
          ]),
        ),
      )
      .orderBy(orderColumn, direction)
      .orderBy("id", direction)
      .selectAll()
      .execute();

    // 順序は維持してくれるみたい
    const userPosts = Map.groupBy(posts, (post) => post.userId);

    const kv = new Map(userPosts.entries().map(([key, value]) => [key, value.slice(0, limit)]));

    return keys.map((key) => kv.get(key.id) ?? []);
  };

  const loader = new DataLoader(batchGet, { cacheKeyFn: (key) => key.id });

  return (params: Params) => {
    sharedParams ??= params;
    return loader;
  };
};
