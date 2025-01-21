import type { OverrideProperties } from "type-fest";

import type { BlockInsert, BlockSelect } from "../generated/types-extension.ts";
import type { UserId } from "./user/id.ts";

export type BlockKey = Pick<Block, "blockerId" | "blockeeId">;

export type Block = OverrideProperties<
  BlockSelect,
  {
    blockerId: UserId;
    blockeeId: UserId;
  }
>;

export type NewBlock = OverrideProperties<
  BlockInsert,
  {
    blockerId: UserId;
    blockeeId: UserId;
  }
>;
