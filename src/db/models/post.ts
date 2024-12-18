import type { OverrideProperties } from "type-fest";

import type { PostInsert, PostSelect, PostUpdate } from "../generated/types-extension.ts";
import type { PostId } from "./post/id.ts";
import type { UserId } from "./user/id.ts";

export type Post = OverrideProperties<
  PostSelect,
  {
    id: PostId;
    userId: UserId;
    parentId: PostId | null;
  }
>;

export type NewPost = OverrideProperties<
  PostInsert,
  {
    id: PostId;
    userId: UserId;
    parentId?: PostId | null;
  }
>;

export type UpdPost = OverrideProperties<
  PostUpdate,
  {
    id?: PostId;
    userId?: UserId;
    parentId?: PostId | null;
  }
>;
