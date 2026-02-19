import { authAdminOrUserOwner } from "../_authorizers/user/admin-or-owner.ts";
import { forbiddenError } from "../_errors/global/forbidden.ts";
import type { UserResolvers } from "../_types.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    createdAt: DateTime @semanticNonNull
  }
`;

export const resolver: NonNullable<UserResolvers["createdAt"]> = async (parent, _args, context) => {
  const ctx = authAdminOrUserOwner(context, parent);
  if (Error.isError(ctx)) {
    throw forbiddenError(ctx);
  }

  return parent.createdAt;
};
