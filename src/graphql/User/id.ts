import type { UserResolvers } from "../../schema.ts";
import { userId } from "../_adapters/user/id.ts";
import { authAdminOrUserOwner } from "../_authorizers/user/adminOrUserOwner.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";

export const typeDef = /* GraphQL */ `
  extend type User implements Node {
    id: ID!
  }
`;

export const resolver: NonNullable<UserResolvers["id"]> = (parent, _args, context) => {
  const authed = authAdminOrUserOwner(context, parent);
  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  return userId(parent.id);
};
