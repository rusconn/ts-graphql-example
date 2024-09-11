import type { UserResolvers } from "../../../schema.ts";
import { userNodeId } from "../common/adapter.ts";
import { authAdminOrUserOwner } from "../common/authorizer.ts";
import { getUser } from "../common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type User implements Node {
    id: ID!
  }
`;

export const resolver: UserResolvers["id"] = async (parent, _args, context) => {
  authAdminOrUserOwner(context, parent);

  const user = await getUser(context, parent);

  return userNodeId(user.id);
};
