import type { UserResolvers } from "../../schema.ts";
import { authAdminOrUserOwner } from "../_authorizers/user/adminOrUserOwner.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    createdAt: DateTime @semanticNonNull
  }
`;

export const resolver: NonNullable<UserResolvers["createdAt"]> = async (parent, _args, context) => {
  const authed = authAdminOrUserOwner(context, parent);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  if ("createdAt" in parent) {
    return parent.createdAt;
  }

  const user = await context.repos.user.load(parent.id);

  if (!user) {
    throw internalServerError();
  }

  return user.createdAt;
};
