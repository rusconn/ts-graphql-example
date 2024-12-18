import type { UserResolvers } from "../../../schema.ts";
import { dateByUuid } from "../../common/resolvers.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    createdAt: DateTime
  }
`;

export const resolver: UserResolvers["createdAt"] = (parent) => {
  return dateByUuid(parent.id);
};
