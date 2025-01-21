import type { Kysely, Transaction } from "kysely";

import type { DB } from "../db/generated/types.ts";
import type { Block, BlockKey } from "../db/models/block.ts";
import * as blockLoader from "./loaders/block.ts";

export class BlockAPI {
  #db;
  #loaders;

  constructor(db: Kysely<DB>) {
    this.#db = db;
    this.#loaders = {
      block: blockLoader.init(db),
    };
  }

  create = async ({ blockerId, blockeeId }: BlockKey, trx?: Transaction<DB>) => {
    const block = await (trx ?? this.#db)
      .insertInto("Block")
      .values({
        createdAt: new Date(),
        blockerId,
        blockeeId,
      })
      .onConflict((oc) => oc.doNothing())
      .returningAll()
      .executeTakeFirst();

    return block as Block | undefined;
  };

  delete = async ({ blockerId, blockeeId }: BlockKey, trx?: Transaction<DB>) => {
    const block = await (trx ?? this.#db)
      .deleteFrom("Block")
      .where("blockerId", "=", blockerId)
      .where("blockeeId", "=", blockeeId)
      .returningAll()
      .executeTakeFirst();

    return block as Block | undefined;
  };

  load = async (key: blockLoader.Key) => {
    return this.#loaders.block.load(key);
  };
}
