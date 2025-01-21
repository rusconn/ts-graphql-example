import { db as posts } from "./db/post.ts";
import { db as users } from "./db/user.ts";

export const db = {
  ...posts,
  ...users,
};
