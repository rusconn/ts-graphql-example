import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Block = {
  id: string;
  blockerId: string;
  blockeeId: string;
};
export type Follow = {
  id: string;
  followerId: string;
  followeeId: string;
};
export type Hashtag = {
  id: string;
  name: string;
};
export type Like = {
  id: string;
  userId: string;
  postId: string;
};
export type Post = {
  id: string;
  updatedAt: Timestamp;
  content: string;
  userId: string;
  parentId: string | null;
};
export type Tag = {
  postId: string;
  hashtagId: string;
};
export type User = {
  id: string;
  updatedAt: Timestamp;
  avatar: string | null;
  name: string;
  handle: string;
  bio: Generated<string>;
  location: Generated<string>;
  website: Generated<string>;
  email: string;
  password: string;
  token: string | null;
};
export type DB = {
  Block: Block;
  Follow: Follow;
  Hashtag: Hashtag;
  Like: Like;
  Post: Post;
  Tag: Tag;
  User: User;
};
