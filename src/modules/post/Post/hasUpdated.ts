import * as postId from "../../../db/models/post/id.ts";
import type { PostResolvers } from "../../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    hasUpdated: Boolean
  }
`;

export const resolver: PostResolvers["hasUpdated"] = (parent) => {
  return postId.date(parent.id) !== parent.updatedAt;
};
