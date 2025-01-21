import type { PostResolvers } from "../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    updatedAt: DateTime @semanticNonNull
  }
`;

export const resolver: PostResolvers["updatedAt"] = (parent) => {
  return parent.updatedAt;
};
