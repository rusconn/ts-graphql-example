import type { OverrideProperties } from "type-fest";

import type { BlockInsert, BlockSelect } from "../generated/types-extension.ts";
import type { BlockId } from "./block/id.ts";
import type { UserId } from "./user/id.ts";

export type Block = OverrideProperties<
  BlockSelect,
  {
    id: BlockId;
    blockerId: UserId;
    blockeeId: UserId;
  }
>;

export type NewBlock = OverrideProperties<
  BlockInsert,
  {
    id: BlockId;
    blockerId: UserId;
    blockeeId: UserId;
  }
>;
