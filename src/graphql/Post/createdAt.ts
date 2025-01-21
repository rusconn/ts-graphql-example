import * as PostId from "../../models/post/id.ts";
import type { PostResolvers } from "../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    createdAt: DateTime @semanticNonNull
  }
`;

export const resolver: PostResolvers["createdAt"] = (parent) => {
  return PostId.date(parent.id);
};
