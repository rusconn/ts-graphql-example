import type { PostResolvers } from "../../../schema.ts";
import * as postId from "../internal/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    hasUpdated: Boolean
  }
`;

export const resolver: PostResolvers["hasUpdated"] = (parent) => {
  return postId.date(parent.id) !== parent.updatedAt;
};
