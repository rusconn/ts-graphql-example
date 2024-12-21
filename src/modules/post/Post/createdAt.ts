import * as uuidv7 from "../../../lib/uuidv7.ts";
import type { PostResolvers } from "../../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    createdAt: DateTime
  }
`;

export const resolver: PostResolvers["createdAt"] = (parent) => {
  return uuidv7.date(parent.id);
};
