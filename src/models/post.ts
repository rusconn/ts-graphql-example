import type { Except, OverrideProperties } from "type-fest";

import type { PostInsert, PostSelect } from "../db/types-extension.ts";
import type { PostId } from "./post/id.ts";
import type { UserId } from "./user/id.ts";

export type PostKey = {
  id: Post["id"];
  authorId?: Post["authorId"];
  parentId?: Post["parentId"];
};

export type Post = OverrideProperties<
  PostSelect,
  {
    id: PostId;
    authorId: UserId;
    parentId: PostId | null;
  }
>;

export type PostNew = OverrideProperties<
  Except<PostInsert, "id" | "updatedAt">,
  {
    authorId: UserId;
    parentId?: PostId | null;
  }
>;

export type PostUpd = Except<Partial<PostNew>, "status" | "authorId" | "parentId">;
