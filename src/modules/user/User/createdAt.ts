import * as uuidv7 from "../../../lib/uuidv7.ts";
import type { UserResolvers } from "../../../schema.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    createdAt: DateTime
  }
`;

export const resolver: UserResolvers["createdAt"] = (parent) => {
  return uuidv7.date(parent.id);
};
