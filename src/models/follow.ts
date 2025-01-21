import type { Except, OverrideProperties } from "type-fest";

import type { FollowInsert, FollowSelect } from "../db/types-extension.ts";
import type { UserId } from "./user/id.ts";

export type FollowKey = Pick<Follow, "followerId" | "followeeId">;

export type Follow = OverrideProperties<
  FollowSelect,
  {
    followerId: UserId;
    followeeId: UserId;
  }
>;

export type FollowNew = OverrideProperties<
  Except<FollowInsert, "createdAt">,
  {
    followerId: UserId;
    followeeId: UserId;
  }
>;
