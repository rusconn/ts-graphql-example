import * as EmailAddress from "../../lib/string/emailAddress.ts";
import type { UserResolvers } from "../../schema.ts";
import { authAdminOrUserOwner } from "../_authorizers/user/adminOrUserOwner.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    email: EmailAddress @semanticNonNull @complexity(value: 2)
  }
`;

export const resolver: NonNullable<UserResolvers["email"]> = async (parent, _args, context) => {
  const authed = authAdminOrUserOwner(context, parent);
  if (Error.isError(authed)) {
    throw forbiddenErr(authed);
  }

  if (!EmailAddress.is(parent.email)) {
    throw internalServerError();
  }

  return parent.email;
};
