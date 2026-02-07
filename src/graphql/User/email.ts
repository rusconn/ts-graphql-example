import type * as Db from "../../db/types.ts";
import * as EmailAddress from "../../lib/string/emailAddress.ts";
import type * as Graph from "../../schema.ts";
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

export const userEmail = (email: Db.User["email"]): NonNullable<Graph.User["email"]> | Error => {
  return EmailAddress.is(email) ? email : new Error("invalid email");
};
