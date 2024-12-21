import * as uuidv7 from "../../../lib/uuidv7.ts";
import type { PostResolvers } from "../../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    hasUpdated: Boolean
  }
`;

export const resolver: PostResolvers["hasUpdated"] = (parent) => {
  return uuidv7.date(parent.id) !== parent.updatedAt;
};
