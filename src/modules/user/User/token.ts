import type { UserResolvers } from "../../../schema.ts";
import { authUserOwner } from "../common/authorizer.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    token: NonEmptyString
  }
`;

export const resolver: UserResolvers["token"] = (parent, _args, context) => {
  authUserOwner(context, parent);

  return parent.token;
};
