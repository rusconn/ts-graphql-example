import type { UserResolvers } from "../../schema.ts";
import { authAdminOrUserOwner } from "../_authorizers/user/adminOrUserOwner.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    email: EmailAddress @semanticNonNull
  }
`;

export const resolver: UserResolvers["email"] = async (parent, _args, context) => {
  const authed = authAdminOrUserOwner(context, parent);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  if ("email" in parent) {
    return parent.email;
  }

  const user = await context.api.user.load(parent.id);

  if (!user) {
    throw internalServerError();
  }

  return user.email;
};
