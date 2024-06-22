import type { UserResolvers } from "../../common/schema.ts";
import { authAdminOrUserOwner } from "../common/authorizer.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    name: NonEmptyString
  }
`;

export const resolver: UserResolvers["name"] = (parent, _args, context) => {
  authAdminOrUserOwner(context, parent);

  return parent.name;
};
