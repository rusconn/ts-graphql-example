import type { UserResolvers } from "../../../schema.ts";
import { auth } from "../../common/authorizers.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    email: EmailAddress
  }
`;

export const resolver: UserResolvers["email"] = (parent, _args, context) => {
  auth(context);

  return parent.email;
};
