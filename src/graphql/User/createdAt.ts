import * as UserId from "../../models/user/id.ts";
import type { UserResolvers } from "../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    createdAt: DateTime @semanticNonNull
  }
`;

export const resolver: UserResolvers["createdAt"] = (parent) => {
  return UserId.date(parent.id);
};
