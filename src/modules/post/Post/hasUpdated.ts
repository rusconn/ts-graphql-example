import type { PostResolvers } from "../../../schema.ts";
import { dateByUuid } from "../../common/resolvers.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    hasUpdated: Boolean
  }
`;

export const resolver: PostResolvers["hasUpdated"] = (parent) => {
  return dateByUuid(parent.id) !== parent.updatedAt;
};
