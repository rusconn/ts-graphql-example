import type { UserResolvers } from "../../schema.ts";
import { authUserOwner } from "../_authorizers/user/userOwner.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    email: EmailAddress @semanticNonNull
  }
`;

export const resolver: UserResolvers["email"] = (parent, _args, context) => {
  const authed = authUserOwner(context, parent);

  if (authed instanceof Error) {
    throw forbiddenErr();
  }

  return parent.email;
};
