import type { OverrideProperties } from "type-fest";

import type { FollowInsert, FollowSelect } from "../generated/types-extension.ts";
import type { UserId } from "./user/id.ts";

export type FollowKey = Pick<Follow, "followerId" | "followeeId">;

export type Follow = OverrideProperties<
  FollowSelect,
  {
    followerId: UserId;
    followeeId: UserId;
  }
>;

export type NewFollow = OverrideProperties<
  FollowInsert,
  {
    followerId: UserId;
    followeeId: UserId;
  }
>;
