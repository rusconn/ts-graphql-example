import { PostStatus } from "../../db/types.ts";
import type { PostResolvers } from "../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    hasDeleted: Boolean @semanticNonNull
  }
`;

export const resolver: PostResolvers["hasDeleted"] = (parent) => {
  return parent.status === PostStatus.Deleted;
};
