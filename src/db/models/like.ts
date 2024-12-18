import type { OverrideProperties } from "type-fest";

import type { LikeInsert, LikeSelect } from "../generated/types-extension.ts";
import type { LikeId } from "./like/id.ts";
import type { PostId } from "./post/id.ts";
import type { UserId } from "./user/id.ts";

export type Like = OverrideProperties<
  LikeSelect,
  {
    id: LikeId;
    userId: UserId;
    postId: PostId;
  }
>;

export type NewLike = OverrideProperties<
  LikeInsert,
  {
    id: LikeId;
    userId: UserId;
    postId: PostId;
  }
>;
