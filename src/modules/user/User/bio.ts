import type { UserResolvers } from "../../../schema.ts";
import { auth } from "../../common/authorizers.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    bio: String
  }
`;

export const resolver: UserResolvers["bio"] = (parent, _args, context) => {
  auth(context);

  return parent.bio;
};
