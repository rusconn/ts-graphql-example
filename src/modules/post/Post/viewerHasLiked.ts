import type { PostResolvers } from "../../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    viewerHasLiked: Boolean
  }
`;

export const resolver: PostResolvers["viewerHasLiked"] = async (parent, _args, context) => {
  if (context.user == null) {
    return false;
  }

  const like = await context.db
    .selectFrom("LikerPost")
    .where("userId", "=", context.user.id)
    .where("postId", "=", parent.id)
    .select("userId")
    .executeTakeFirst();

  return like != null;
};
