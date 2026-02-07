import type { UserResolvers } from "../../schema.ts";
import { userEmail } from "../_adapters/user/email.ts";
import { authAdminOrUserOwner } from "../_authorizers/user/adminOrUserOwner.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";

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

  const email = userEmail(parent.email);

  if (Error.isError(email)) {
    throw internalServerError(email);
  }

  return email;
};
