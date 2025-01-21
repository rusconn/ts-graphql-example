// prisma-kysely が生成する型が足りないので用意した
// TODO: 下記プルリクがマージされたらこのファイルは不要になるので消す
// https://github.com/valtyr/prisma-kysely/pull/85

import type { Insertable, Selectable } from "kysely";

import type { Block, Follow, Like, Post, User, UserCredential, UserToken } from "./types.ts";

export type BlockSelect = Selectable<Block>;
export type BlockInsert = Insertable<Block>;

export type FollowSelect = Selectable<Follow>;
export type FollowInsert = Insertable<Follow>;

export type LikeSelect = Selectable<Like>;
export type LikeInsert = Insertable<Like>;

export type PostSelect = Selectable<Post>;
export type PostInsert = Insertable<Post>;

export type UserSelect = Selectable<User>;
export type UserInsert = Insertable<User>;

export type UserCredentialSelect = Selectable<UserCredential>;
export type UserCredentialInsert = Insertable<UserCredential>;

export type UserTokenSelect = Selectable<UserToken>;
export type UserTokenInsert = Insertable<UserToken>;
