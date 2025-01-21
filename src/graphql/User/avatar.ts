import type { UserResolvers } from "../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    avatar: URL @semanticNonNull
  }
`;

export const resolver: UserResolvers["avatar"] = (parent) => {
  return parent.avatar;
};
