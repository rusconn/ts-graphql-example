import * as userId from "../../db/models/user/id.ts";
import type { UserResolvers } from "../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    createdAt: DateTime
  }
`;

export const resolver: UserResolvers["createdAt"] = (parent) => {
  return userId.date(parent.id);
};
