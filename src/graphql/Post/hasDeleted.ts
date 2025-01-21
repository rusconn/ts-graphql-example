import { PostStatus } from "../../db/generated/types.ts";
import type { PostResolvers } from "../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    hasDeleted: Boolean
  }
`;

export const resolver: PostResolvers["hasDeleted"] = (parent) => {
  return parent.status === PostStatus.Deleted;
};
