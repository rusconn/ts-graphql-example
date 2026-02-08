import type { UserResolvers } from "../_schema.ts";
import { authAdminOrUserOwner } from "../_authorizers/user/adminOrUserOwner.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    email: EmailAddress @semanticNonNull @complexity(value: 2)
  }
`;

export const resolver: NonNullable<UserResolvers["email"]> = async (parent, _args, context) => {
  const ctx = authAdminOrUserOwner(context, parent);
  if (Error.isError(ctx)) {
    throw forbiddenErr(ctx);
  }

  return parent.email;
};
