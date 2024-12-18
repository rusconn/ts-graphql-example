import type { PostResolvers } from "../../../schema.ts";
import { dateByUuid } from "../../common/resolvers.ts";

export const typeDef = /* GraphQL */ `
  extend type Post {
    createdAt: DateTime
  }
`;

export const resolver: PostResolvers["createdAt"] = (parent) => {
  return dateByUuid(parent.id);
};
