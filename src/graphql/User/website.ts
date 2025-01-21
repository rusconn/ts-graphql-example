import type { UserResolvers } from "../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    website: URL
  }
`;

export const resolver: UserResolvers["website"] = (parent) => {
  return parent.website;
};
