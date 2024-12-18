import type { UserResolvers } from "../../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    bio: String
  }
`;

export const resolver: UserResolvers["bio"] = (parent) => {
  return parent.bio;
};
