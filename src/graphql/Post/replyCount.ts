import type { PostResolvers } from "../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    replyCount: Int @semanticNonNull
  }
`;

export const resolver: PostResolvers["replyCount"] = async (parent, _args, context) => {
  return await context.api.post.loadReplyCount(parent.id);
};
