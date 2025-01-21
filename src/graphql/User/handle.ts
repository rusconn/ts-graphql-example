import type { UserResolvers } from "../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    handle: String @semanticNonNull
  }
`;

export const resolver: UserResolvers["handle"] = (parent) => {
  return parent.handle;
};
