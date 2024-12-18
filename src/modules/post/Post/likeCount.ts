import type { PostResolvers } from "../../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    likeCount: Int
  }
`;

export const resolver: PostResolvers["likeCount"] = async (parent, _args, context) => {
  return await context.api.post.loadLikeCount(parent.id);
};
