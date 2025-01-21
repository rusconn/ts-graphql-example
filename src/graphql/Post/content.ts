import type { PostResolvers } from "../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    content: String @semanticNonNull
  }
`;

export const resolver: PostResolvers["content"] = (parent) => {
  return parent.content;
};
