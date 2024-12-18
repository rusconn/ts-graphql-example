import type { UserResolvers } from "../../../schema.ts";
import { auth } from "../../common/authorizers.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    name: NonEmptyString
  }
`;

export const resolver: UserResolvers["name"] = (parent, _args, context) => {
  auth(context);

  return parent.name;
};
