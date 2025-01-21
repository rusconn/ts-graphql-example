import type { PostResolvers } from "../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    likeCount: Int @semanticNonNull
  }
`;

export const resolver: PostResolvers["likeCount"] = async (parent, _args, context) => {
  return await context.api.like.loadCountByPostId(parent.id);
};
