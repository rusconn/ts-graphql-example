import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../../../db/generated/types.ts";
import type { Block } from "../../../../db/models/block.ts";
import type { User } from "../../../../db/models/user.ts";

export type Key = Block["blockerId"];

export type Params = Pagination;

type Pagination = {
  cursor?: Block["id"];
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
    const blockees = await db
      .with("results", (db) =>
        db
          .selectFrom("Block")
          .innerJoin("User", "blockeeId", "User.id")
          .where("blockerId", "in", keys)
          .$if(cursor != null, (qb) => qb.where(({ eb }) => eb("Block.id", comp, cursor!)))
          .selectAll("User")
          .select("blockerId")
          .select("Block.id as bid")
          .select(({ fn }) =>
            fn
              .agg<number>("row_number")
              .over((ob) =>
                ob //
                  .partitionBy("blockerId")
                  .orderBy("Block.id", direction),
              )
              .as("nth"),
          ),
      )
      .selectFrom("results")
      .where("nth", "<=", limit)
      .selectAll()
      .orderBy("bid", direction)
      .execute();

    // 順序は維持してくれるみたい
    const userBlockings = Map.groupBy(
      blockees as (User & Pick<Block, "blockerId"> & { bid: Block["id"] } & { nth: number })[],
      (blockee) => blockee.blockerId,
    );

    return keys.map((key) => userBlockings.get(key) ?? []);
  };

  const loader = new DataLoader(batchGet);

  return (params: Params) => {
    sharedParams ??= params;
    return loader;
  };
};
