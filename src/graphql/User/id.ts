import type { UserResolvers } from "../../schema.ts";
import { userId } from "../_adapters/user/id.ts";

export const typeDef = /* GraphQL */ `
  extend type User implements Node {
    id: ID!
  }
`;

export const resolver: UserResolvers["id"] = (parent) => {
  return userId(parent.id);
};
