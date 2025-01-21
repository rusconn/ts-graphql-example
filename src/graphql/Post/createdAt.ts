import * as postId from "../../db/models/post/id.ts";
import type { PostResolvers } from "../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    createdAt: DateTime
  }
`;

export const resolver: PostResolvers["createdAt"] = (parent) => {
  return postId.date(parent.id);
};
