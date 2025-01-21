import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/types.ts";
import { sortGroup } from "../../lib/dataloader/sortGroup.ts";
import type { Block } from "../../models/block.ts";
import type { User } from "../../models/user.ts";

export type Key = {
  blockeeId: Block["blockeeId"];
  reverse: boolean;
  cursor?: Block;
  limit: number;
};

export type Blocker = {
  user: User;
  cursor: Block;
};

export const init = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db), { cacheKeyFn: JSON.stringify });
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const blockeeIds = keys.map((key) => key.blockeeId);
  const { reverse, cursor, limit } = keys.at(0)!;

  const [direction, comp] = reverse
    ? (["desc", "<"] as const) //
    : (["asc", ">"] as const);

  const blockers = await db
    .selectFrom("User")
    .innerJoinLateral(
      (eb) =>
        eb
          .selectFrom("User as u")
          .innerJoin("Block as b", "u.id", "b.blockerId")
          .whereRef("User.id", "=", "b.blockeeId")
          .$if(cursor != null, (qb) =>
            qb.where(({ eb, refTuple, tuple }) =>
              eb(
                refTuple("b.createdAt", "b.blockerId", "b.blockeeId"),
                comp,
                tuple(cursor!.createdAt, cursor!.blockerId, cursor!.blockeeId),
              ),
            ),
          )
          .selectAll("u")
          .select([
            "b.createdAt as bcreatedAt",
            "b.blockerId as bblockerId",
            "b.blockeeId as bblockeeId",
          ])
          .orderBy("b.createdAt", direction)
          .orderBy("b.blockerId", direction)
          .orderBy("b.blockeeId", direction)
          .limit(limit)
          .as("blockers"),
      (join) => join.onTrue(),
    )
    .where("User.id", "in", blockeeIds)
    .selectAll("blockers")
    // サブクエリの結果順を維持することを想定して order by は指定していない
    .execute();

  const formattedBlockers = blockers.map(({ bcreatedAt, bblockerId, bblockeeId, ...user }) => ({
    user,
    cursor: {
      createdAt: bcreatedAt,
      blockerId: bblockerId,
      blockeeId: bblockeeId,
    },
  })) as Blocker[];

  return sortGroup(blockeeIds, formattedBlockers, (blocker) => blocker.cursor.blockeeId);
};
