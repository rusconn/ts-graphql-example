import type { UserResolvers } from "../../../schema.ts";
import { authAdminOrUserOwner } from "../common/authorizer.ts";
import { getUser } from "../common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    name: NonEmptyString
  }
`;

export const resolver: UserResolvers["name"] = async (parent, _args, context) => {
  authAdminOrUserOwner(context, parent);

  const user = await getUser(context, parent);

  return user.name;
};
