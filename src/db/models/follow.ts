import type { OverrideProperties } from "type-fest";

import type { FollowInsert, FollowSelect } from "../generated/types-extension.ts";
import type { FollowId } from "./follow/id.ts";
import type { UserId } from "./user/id.ts";

export type Follow = OverrideProperties<
  FollowSelect,
  {
    id: FollowId;
    followerId: UserId;
    followeeId: UserId;
  }
>;

export type NewFollow = OverrideProperties<
  FollowInsert,
  {
    id: FollowId;
    followerId: UserId;
    followeeId: UserId;
  }
>;
