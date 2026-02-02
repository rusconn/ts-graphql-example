import type { UserResolvers } from "../../schema.ts";
import { authAdminOrUserOwner } from "../_authorizers/user/adminOrUserOwner.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    updatedAt: DateTime @semanticNonNull @complexity(value: 2)
  }
`;

export const resolver: NonNullable<UserResolvers["updatedAt"]> = async (parent, _args, context) => {
  const authed = authAdminOrUserOwner(context, parent);
  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  return parent.updatedAt;
};
