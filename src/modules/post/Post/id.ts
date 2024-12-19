import type { PostResolvers } from "../../../schema.ts";
import { postNodeId } from "../common/adapter.ts";

export const typeDef = /* GraphQL */ `
  extend type Post implements Node {
    id: ID!
  }
`;

export const resolver: PostResolvers["id"] = (parent) => {
  return postNodeId(parent.id);
};
