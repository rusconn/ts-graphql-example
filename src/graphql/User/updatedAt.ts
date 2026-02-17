import { authAdminOrUserOwner } from "../_authorizers/user/admin-or-owner.ts";
import { forbiddenErr } from "../_errors/global/forbidden.ts";
import type { UserResolvers } from "../_schema.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    updatedAt: DateTime @semanticNonNull @complexity(value: 2)
  }
`;

export const resolver: NonNullable<UserResolvers["updatedAt"]> = async (parent, _args, context) => {
  const ctx = authAdminOrUserOwner(context, parent);
  if (Error.isError(ctx)) {
    throw forbiddenErr(ctx);
  }

  return parent.updatedAt;
};
