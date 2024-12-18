import type { UserResolvers } from "../../../schema.ts";
import { auth } from "../../common/authorizers.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    location: String
  }
`;

export const resolver: UserResolvers["location"] = (parent, _args, context) => {
  auth(context);

  return parent.location;
};
