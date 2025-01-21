import type { UserResolvers } from "../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    bio: String @semanticNonNull
  }
`;

export const resolver: UserResolvers["bio"] = (parent) => {
  return parent.bio;
};
