import type { UserResolvers } from "../../../schema.ts";
import { forbiddenErr } from "../../common/resolvers.ts";
import { userNodeId } from "../adapters.ts";
import { authAdminOrUserOwner } from "../authorizers.ts";

export const typeDef = /* GraphQL */ `
  extend type User implements Node {
    id: ID!
  }
`;

export const resolver: UserResolvers["id"] = (parent, _args, context) => {
  const authed = authAdminOrUserOwner(context, parent);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  return userNodeId(parent.id);
};
