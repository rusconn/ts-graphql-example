import type { Except, OverrideProperties } from "type-fest";

import type { BlockInsert, BlockSelect } from "../db/types-extension.ts";
import type { UserId } from "./user/id.ts";

export type BlockKey = Pick<Block, "blockerId" | "blockeeId">;

export type Block = OverrideProperties<
  BlockSelect,
  {
    blockerId: UserId;
    blockeeId: UserId;
  }
>;

export type BlockNew = OverrideProperties<
  Except<BlockInsert, "createdAt">,
  {
    blockerId: UserId;
    blockeeId: UserId;
  }
>;
