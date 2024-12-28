import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../../../db/generated/types.ts";
import type { Like } from "../../../../db/models/like.ts";
import type { User } from "../../../../db/models/user.ts";

type Key = Like["postId"];

export type Params = Pagination;

type Pagination = {
  cursor?: Like["id"];
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

    // TODO: partition by へ変更する

    // 本当は各 key に対する select limit を union all したいが、
    // kysely が集合演算を正しく実装していないようなので別の方法で実現した。
    // クエリの効率は悪いが、全件取得後にオンメモリで limit するよりマシ。
    const likers = await db
      .selectFrom("Like")
      .innerJoin("User", "User.id", "Like.userId")
      .where("postId", "in", keys)
      .$if(cursor != null, (qb) => qb.where("Like.id", comp, cursor!))
      .selectAll("User")
      .select("Like.id as lid")
      .select("Like.postId as lpid")
      .orderBy("Like.id", direction)
      .execute();

    // 順序は維持してくれるみたい
    const postLikers = Map.groupBy(
      likers as (User & { lid: Like["id"]; lpid: Like["postId"] })[],
      (liker) => liker.lpid,
    );

    const kv = new Map(postLikers.entries().map(([key, value]) => [key, value.slice(0, limit)]));

    return keys.map((key) => kv.get(key) ?? []);
  };

  const loader = new DataLoader(batchGet);

  return (params: Params) => {
    sharedParams ??= params;
    return loader;
  };
};
