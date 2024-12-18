import type { Context } from "../../../context.ts";
import type { PostKey } from "../../../db/loaders/mod.ts";
import type { PostSelect } from "../../../db/models.ts";
import { notFoundErr } from "../../common/resolvers.ts";

export type Post = PostSelect;

export const getPost = async (context: Pick<Context, "loaders">, key: PostKey) => {
  const post = await context.loaders.post.load(key);

  if (!post) {
    throw notFoundErr();
  }

  return post;
};
