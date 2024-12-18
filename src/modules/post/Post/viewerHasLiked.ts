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

  const like = await context.api.post.loadLike({
    postId: parent.id,
    userId: context.user.id,
  });

  return like != null;
};
