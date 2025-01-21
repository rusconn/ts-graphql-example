import type { UserResolvers } from "../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    updatedAt: DateTime
  }
`;

export const resolver: UserResolvers["updatedAt"] = (parent) => {
  return parent.updatedAt;
};
