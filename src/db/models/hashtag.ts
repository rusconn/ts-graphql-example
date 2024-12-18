import type { OverrideProperties } from "type-fest";

import type { HashtagInsert, HashtagSelect, HashtagUpdate } from "../generated/types-extension.ts";
import type { HashtagId } from "./hashtag/id.ts";
import type { HashtagName } from "./hashtag/name.ts";
import type { UserId } from "./user/id.ts";

export type Hashtag = OverrideProperties<
  HashtagSelect,
  {
    id: HashtagId;
    name: HashtagName;
  }
>;

export type NewHashtag = OverrideProperties<
  HashtagInsert,
  {
    id: HashtagId;
    name: HashtagName;
  }
>;

export type UpdHashtag = OverrideProperties<
  HashtagUpdate,
  {
    id?: UserId;
    name?: HashtagName;
  }
>;
