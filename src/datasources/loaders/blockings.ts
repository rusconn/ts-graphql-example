import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/generated/types.ts";
import type { Block } from "../../db/models/block.ts";
import type { User } from "../../db/models/user.ts";

export type Key = Block["blockerId"];

export type Params = Pagination;

type Pagination = {
  cursor?: Block;
  limit: number;
  reverse: boolean;
};

export type Blocking = {
  user: User;
  cursor: Block;
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
    const blockings = await db
      .with("results", (db) =>
        db
          .selectFrom("User")
          .innerJoin("Block", "User.id", "Block.blockeeId")
          .where("Block.blockerId", "in", keys)
          .$if(cursor != null, (qb) =>
            qb.where(({ eb, refTuple, tuple }) =>
              eb(
                refTuple("Block.createdAt", "Block.blockerId", "Block.blockeeId"),
                comp,
                tuple(cursor!.createdAt, cursor!.blockerId, cursor!.blockeeId),
              ),
            ),
          )
          .selectAll("User")
          .select([
            "Block.createdAt as bcreatedAt",
            "Block.blockerId as bblockerId",
            "Block.blockeeId as bblockeeId",
          ])
          .select(({ fn }) =>
            fn
              .agg<number>("row_number")
              .over((ob) =>
                ob
                  .partitionBy("Block.blockerId")
                  .orderBy("Block.createdAt", direction)
                  .orderBy("Block.blockerId", direction)
                  .orderBy("Block.blockeeId", direction),
              )
              .as("nth"),
          ),
      )
      .selectFrom("results")
      .where("nth", "<=", limit)
      .select([
        "id",
        "updatedAt",
        "avatar",
        "name",
        "handle",
        "bio",
        "location",
        "website",
        "email",
        "password",
        "token",
        "bcreatedAt",
        "bblockerId",
        "bblockeeId",
      ])
      .orderBy("nth", "asc")
      .execute();

    const formattedBlockings = blockings.map(({ bcreatedAt, bblockerId, bblockeeId, ...user }) => ({
      user,
      cursor: {
        createdAt: bcreatedAt,
        blockerId: bblockerId,
        blockeeId: bblockeeId,
      },
    })) as Blocking[];

    // 順序は維持してくれるみたい
    const userBlockings = Map.groupBy(formattedBlockings, (blocking) => blocking.cursor.blockerId);

    return keys.map((key) => userBlockings.get(key) ?? []);
  };

  const loader = new DataLoader(batchGet);

  return (params: Params) => {
    sharedParams ??= params;
    return loader;
  };
};
