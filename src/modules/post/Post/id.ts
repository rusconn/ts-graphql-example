import type { PostResolvers } from "../../../schema.ts";
import { postId } from "../adapters/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Post implements Node {
    id: ID!
  }
`;

export const resolver: PostResolvers["id"] = (parent) => {
  return postId(parent.id);
};