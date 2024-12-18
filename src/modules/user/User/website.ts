import type { UserResolvers } from "../../../schema.ts";
import { auth } from "../../common/authorizers.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    website: URL
  }
`;

export const resolver: UserResolvers["website"] = (parent, _args, context) => {
  auth(context);

  return parent.website;
};
