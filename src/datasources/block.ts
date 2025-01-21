import type { Kysely } from "kysely";

import type { DB } from "../db/types.ts";
import { PgErrorCode, isPgError } from "../lib/pg/error.ts";
import type { Block, BlockKey, BlockNew } from "../models/block.ts";
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

  get = async ({ blockerId, blockeeId }: BlockKey) => {
    const block = await this.#db
      .selectFrom("Block")
      .where("blockerId", "=", blockerId)
      .where("blockeeId", "=", blockeeId)
      .selectAll()
      .executeTakeFirst();

    return block as Block | undefined;
  };

  create = async ({ blockerId, blockeeId }: BlockNew) => {
    try {
      const block = await this.#db
        .insertInto("Block")
        .values({ createdAt: new Date(), blockerId, blockeeId })
        .returningAll()
        .executeTakeFirstOrThrow();

      return { type: "Success", block: block as Block } as const;
    } catch (e) {
      if (isPgError(e)) {
        if (e.code === PgErrorCode.UniqueViolation) {
          return { type: "BlockAlreadyExists" } as const;
        }
        if (e.code === PgErrorCode.ForeignKeyViolation) {
          if (e.constraint?.includes("blockeeId")) {
            return { type: "BlockeeNotExists" } as const;
          }
        }
      }

      return {
        type: "Unknown",
        e: e instanceof Error ? e : new Error("unknown", { cause: e }),
      } as const;
    }
  };

  delete = async ({ blockerId, blockeeId }: BlockKey) => {
    const block = await this.#db
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
