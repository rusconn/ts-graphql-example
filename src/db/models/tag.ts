import type { OverrideProperties } from "type-fest";

import type { TagInsert, TagSelect } from "../generated/types-extension.ts";
import type { HashtagId } from "./hashtag/id.ts";
import type { PostId } from "./post/id.ts";

export type Tag = OverrideProperties<
  TagSelect,
  {
    postId: PostId;
    hashtagId: HashtagId;
  }
>;

export type NewTag = OverrideProperties<
  TagInsert,
  {
    postId: PostId;
    hashtagId: HashtagId;
  }
>;
