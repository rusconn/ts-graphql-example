import type { UserResolvers } from "../../../schema.ts";
import { userNodeId } from "../common/adapter.ts";

export const typeDef = /* GraphQL */ `
  extend type User implements Node {
    id: ID!
  }
`;

export const resolver: UserResolvers["id"] = (parent) => {
  return userNodeId(parent.id);
};
