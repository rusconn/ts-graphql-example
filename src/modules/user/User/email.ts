import type { UserResolvers } from "../../../schema.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import { authUserOwner } from "../authorizers/userOwner.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    email: EmailAddress
  }
`;

export const resolver: UserResolvers["email"] = (parent, _args, context) => {
  const authed = authUserOwner(context, parent);

  if (authed instanceof Error) {
    throw forbiddenErr();
  }

  return parent.email;
};
