import { authAdminOrUserOwner } from "../_authorizers/user/admin-or-owner.ts";
import { forbiddenErr } from "../_errors/global/forbidden.ts";
import type { UserResolvers } from "../_schema.ts";
import { nodeId } from "../Node/id.ts";

export const typeDef = /* GraphQL */ `
  extend type User implements Node {
    id: ID!
  }
`;

export const resolver: NonNullable<UserResolvers["id"]> = (parent, _args, context) => {
  const ctx = authAdminOrUserOwner(context, parent);
  if (Error.isError(ctx)) {
    throw forbiddenErr(ctx);
  }

  return userId(parent.id);
};

export const userId = nodeId("User");
