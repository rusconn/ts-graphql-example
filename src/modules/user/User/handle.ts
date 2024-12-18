import type { UserResolvers } from "../../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    handle: NonEmptyString
  }
`;

export const resolver: UserResolvers["handle"] = (parent) => {
  return parent.handle;
};
