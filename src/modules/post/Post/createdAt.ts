import type { PostResolvers } from "../../../schema.ts";
import * as postId from "../internal/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    createdAt: DateTime
  }
`;

export const resolver: PostResolvers["createdAt"] = (parent) => {
  return postId.date(parent.id);
};
