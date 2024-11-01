import type { UserResolvers } from "../../../schema.ts";
import { authAdminOrUserOwner } from "../common/authorizer.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    updatedAt: DateTime
  }
`;

export const resolver: UserResolvers["updatedAt"] = (parent, _args, context) => {
  authAdminOrUserOwner(context, parent);

  return parent.updatedAt;
};
