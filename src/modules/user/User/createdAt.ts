import type { UserResolvers } from "../../../schema.ts";
import { dateByUlid } from "../../common/resolvers.ts";
import { authAdminOrUserOwner } from "../common/authorizer.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    createdAt: DateTime
  }
`;

export const resolver: UserResolvers["createdAt"] = (parent, _args, context) => {
  authAdminOrUserOwner(context, parent);

  return dateByUlid(parent.id);
};
