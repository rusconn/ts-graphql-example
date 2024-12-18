import type { Context } from "../../../context.ts";
import type { PostKey } from "../../../db/loaders/mod.ts";
import type { PostSelect } from "../../../db/models.ts";

export type Post = PostSelect;

export const getPost = async (context: Pick<Context, "loaders">, key: PostKey) => {
  return await context.loaders.post.load(key);
};
