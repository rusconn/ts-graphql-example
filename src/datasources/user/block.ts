import type { Kysely, Transaction } from "kysely";

import type { DB } from "../../db/generated/types.ts";
import type { Block, NewBlock } from "../../db/models/block.ts";
import * as blockId from "../../db/models/block/id.ts";

export class UserBlockAPI {
  #db;

  constructor(db: Kysely<DB>) {
    this.#db = db;
  }

  // TODO: dataloaderを使う
  load = async (key: {
    blockerId: Block["blockerId"];
    blockeeId: Block["blockeeId"];
  }) => {
    const block = await this.#db
      .selectFrom("Block")
      .where("blockerId", "=", key.blockerId)
      .where("blockeeId", "=", key.blockeeId)
      .selectAll()
      .executeTakeFirst();

    return block as Block | undefined;
  };

  // TODO: dataloaderを使う
  loadBlockerCount = async (blockeeId: Block["blockeeId"]) => {
    const result = await this.#db
      .selectFrom("Block")
      .where("blockeeId", "=", blockeeId)
      .select(({ fn }) => fn.countAll().as("count"))
      .executeTakeFirstOrThrow();

    return Number(result.count);
  };

  // TODO: dataloaderを使う
  loadBlockeeCount = async (blockerId: Block["blockerId"]) => {
    const result = await this.#db
      .selectFrom("Block")
      .where("blockerId", "=", blockerId)
      .select(({ fn }) => fn.countAll().as("count"))
      .executeTakeFirstOrThrow();

    return Number(result.count);
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
