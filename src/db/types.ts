import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const PostStatus = {
  Active: "Active",
  Deleted: "Deleted",
} as const;
export type PostStatus = typeof PostStatus[keyof typeof PostStatus];
export type Block = {
  createdAt: Timestamp;
  blockerId: string;
  blockeeId: string;
};
export type Follow = {
  createdAt: Timestamp;
  followerId: string;
  followeeId: string;
};
export type Like = {
  createdAt: Timestamp;
  userId: string;
  postId: string;
};
export type Post = {
  id: string;
  updatedAt: Timestamp;
  content: string;
  status: Generated<PostStatus>;
  authorId: string;
  parentId: string | null;
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
};
export type UserCredential = {
  userId: string;
  updatedAt: Timestamp;
  password: string;
};
export type UserToken = {
  userId: string;
  updatedAt: Timestamp;
  token: string;
};
export type DB = {
  Block: Block;
  Follow: Follow;
  Like: Like;
  Post: Post;
  User: User;
  UserCredential: UserCredential;
  UserToken: UserToken;
};
