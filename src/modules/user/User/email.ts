import type { UserResolvers } from "../../../schema.ts";
import { authAdminOrUserOwner } from "../common/authorizer.ts";
import { getUser } from "../common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    email: EmailAddress
  }
`;

export const resolver: UserResolvers["email"] = async (parent, _args, context) => {
  authAdminOrUserOwner(context, parent);

  const user = await getUser(context, parent);

  return user.email;
};
