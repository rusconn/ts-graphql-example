import type { UserResolvers } from "../../../schema.ts";
import { dateByUlid } from "../../common/resolvers.ts";
import { authAdminOrUserOwner } from "../common/authorizer.ts";
import { getUser } from "../common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    createdAt: DateTime
  }
`;

export const resolver: UserResolvers["createdAt"] = async (parent, _args, context) => {
  authAdminOrUserOwner(context, parent);

  const user = await getUser(context, parent);

  return dateByUlid(user.id);
};
