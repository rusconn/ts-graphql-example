import type { OverrideProperties } from "type-fest";

import type { LikeInsert, LikeSelect } from "../generated/types-extension.ts";
import type { PostId } from "./post/id.ts";
import type { UserId } from "./user/id.ts";

export type LikeKey = Pick<Like, "userId" | "postId">;

export type Like = OverrideProperties<
  LikeSelect,
  {
    userId: UserId;
    postId: PostId;
  }
>;

export type NewLike = OverrideProperties<
  LikeInsert,
  {
    userId: UserId;
    postId: PostId;
  }
>;
