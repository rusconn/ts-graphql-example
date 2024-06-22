import type { UserResolvers } from "../../common/schema.ts";
import { userNodeId } from "../common/adapter.ts";
import { authAdminOrUserOwner } from "../common/authorizer.ts";

export const typeDef = /* GraphQL */ `
  extend type User implements Node {
    id: ID!
  }
`;

export const resolver: UserResolvers["id"] = (parent, _args, context) => {
  authAdminOrUserOwner(context, parent);

  return userNodeId(parent.id);
};
