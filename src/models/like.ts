import type { Except, OverrideProperties } from "type-fest";

import type { LikeInsert, LikeSelect } from "../db/types-extension.ts";
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

export type LikeNew = OverrideProperties<
  Except<LikeInsert, "createdAt">,
  {
    userId: UserId;
    postId: PostId;
  }
>;
