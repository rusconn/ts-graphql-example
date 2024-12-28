import type { Kysely, Transaction } from "kysely";

import type { DB } from "../../db/generated/types.ts";
import type { Block, NewBlock } from "../../db/models/block.ts";
import * as blockId from "../../db/models/block/id.ts";
import * as userBlockLoader from "./block/loader.ts";
import * as userBlockerCountLoader from "./block/loader/userBlockerCount.ts";
import * as userBlockingCountLoader from "./block/loader/userBlockingCount.ts";

export class UserBlockAPI {
  #db;
  #loaders;

  constructor(db: Kysely<DB>) {
    this.#db = db;
    this.#loaders = {
      block: userBlockLoader.init(db),
      blockerCount: userBlockerCountLoader.init(db),
      blockingCount: userBlockingCountLoader.init(db),
    };
  }

  load = async (key: userBlockLoader.Key) => {
    return this.#loaders.block.load(key);
  };

  loadBlockerCount = async (key: userBlockerCountLoader.Key) => {
    return await this.#loaders.blockerCount.load(key);
  };

  loadBlockingCount = async (key: userBlockingCountLoader.Key) => {
    return await this.#loaders.blockingCount.load(key);
  };

  create = async (
    key: {
      blockerId: NewBlock["blockerId"];
      blockeeId: NewBlock["blockeeId"];
    },
    trx?: Transaction<DB>,
  ) => {
    const id = blockId.gen();

    const block = await (trx ?? this.#db)
      .insertInto("Block")
      .values({
        id,
        blockerId: key.blockerId,
        blockeeId: key.blockeeId,
      })
      .onConflict((oc) => oc.doNothing())
      .returningAll()
      .executeTakeFirst();

    return block as Block | undefined;
  };

  delete = async (
    key: {
      blockerId: Block["blockerId"];
      blockeeId: Block["blockeeId"];
    },
    trx?: Transaction<DB>,
  ) => {
    const block = await (trx ?? this.#db)
      .deleteFrom("Block")
      .where("blockerId", "=", key.blockerId)
      .where("blockeeId", "=", key.blockeeId)
      .returningAll()
      .executeTakeFirst();

    return block as Block | undefined;
  };
}
