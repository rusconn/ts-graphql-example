import type { UserResolvers } from "../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    location: String @semanticNonNull
  }
`;

export const resolver: UserResolvers["location"] = (parent) => {
  return parent.location;
};
