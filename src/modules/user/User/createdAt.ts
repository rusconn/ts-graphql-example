import type { UserResolvers } from "../../../schema.ts";
import { auth } from "../../common/authorizers.ts";
import { dateByUuid } from "../../common/resolvers.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    createdAt: DateTime
  }
`;

export const resolver: UserResolvers["createdAt"] = (parent, _args, context) => {
  auth(context);

  return dateByUuid(parent.id);
};
