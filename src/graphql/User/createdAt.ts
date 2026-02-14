import { authAdminOrUserOwner } from "../_authorizers/user/adminOrUserOwner.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import type { UserResolvers } from "../_schema.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    createdAt: DateTime @semanticNonNull
  }
`;

export const resolver: NonNullable<UserResolvers["createdAt"]> = async (parent, _args, context) => {
  const ctx = authAdminOrUserOwner(context, parent);
  if (Error.isError(ctx)) {
    throw forbiddenErr(ctx);
  }

  return parent.createdAt;
};
