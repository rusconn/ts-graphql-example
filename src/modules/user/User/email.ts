import type { UserResolvers } from "../../../schema.ts";
import { forbiddenErr } from "../../common/resolvers.ts";
import { authAdminOrUserOwner } from "../authorizers.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    email: EmailAddress
  }
`;

export const resolver: UserResolvers["email"] = (parent, _args, context) => {
  const authed = authAdminOrUserOwner(context, parent);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  return parent.email;
};
