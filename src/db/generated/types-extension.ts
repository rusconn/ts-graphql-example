// prisma-kysely が生成する型が足りないので用意した
// TODO: 下記プルリクがマージされたらこのファイルは不要になるので消す
// https://github.com/valtyr/prisma-kysely/pull/85

import type { Insertable, Selectable, Updateable } from "kysely";

import type { Block, Follow, Hashtag, Like, Post, Tag, User } from "./types.ts";

export type BlockSelect = Selectable<Block>;
export type BlockInsert = Insertable<Block>;

export type FollowSelect = Selectable<Follow>;
export type FollowInsert = Insertable<Follow>;

export type HashtagSelect = Selectable<Hashtag>;
export type HashtagInsert = Insertable<Hashtag>;
export type HashtagUpdate = Updateable<Hashtag>;

export type LikeSelect = Selectable<Like>;
export type LikeInsert = Insertable<Like>;

export type TagSelect = Selectable<Tag>;
export type TagInsert = Insertable<Tag>;

export type UserSelect = Selectable<User>;
export type UserInsert = Insertable<User>;
export type UserUpdate = Updateable<User>;

export type PostSelect = Selectable<Post>;
export type PostInsert = Insertable<Post>;
export type PostUpdate = Updateable<Post>;
