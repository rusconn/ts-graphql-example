import type { UserResolvers } from "../../../schema.ts";
import { auth } from "../../common/authorizers.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    updatedAt: DateTime
  }
`;

export const resolver: UserResolvers["updatedAt"] = (parent, _args, context) => {
  auth(context);

  return parent.updatedAt;
};
