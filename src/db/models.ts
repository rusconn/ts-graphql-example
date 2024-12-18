// prisma-kysely が生成する型が足りないので用意した
// TODO: 下記プルリクがマージされたらこのファイルは不要になるので消す
// https://github.com/valtyr/prisma-kysely/pull/85

import type { Selectable } from "kysely";

import type { Hashtag, Post, User } from "./types.ts";

export type HashtagSelect = Selectable<Hashtag>;
export type PostSelect = Selectable<Post>;
export type UserSelect = Selectable<User>;
