import * as PostId from "../../models/post/id.ts";
import type { PostResolvers } from "../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    hasUpdated: Boolean @semanticNonNull
  }
`;

export const resolver: PostResolvers["hasUpdated"] = (parent) => {
  return PostId.date(parent.id) !== parent.updatedAt;
};
