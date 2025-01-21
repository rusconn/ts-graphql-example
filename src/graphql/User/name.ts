import type { UserResolvers } from "../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    name: String @semanticNonNull
  }
`;

export const resolver: UserResolvers["name"] = (parent) => {
  return parent.name;
};
