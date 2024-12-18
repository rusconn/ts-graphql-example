import type { UserResolvers } from "../../../schema.ts";
import { authUserOwner } from "../authorizers/userOwner.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    email: EmailAddress
  }
`;

export const resolver: UserResolvers["email"] = (parent, _args, context) => {
  authUserOwner(context, parent);

  return parent.email;
};
