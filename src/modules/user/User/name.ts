import type { UserResolvers } from "../../../schema.ts";
import { forbiddenErr } from "../../common/resolvers.ts";
import { authAdminOrUserOwner } from "../authorizers.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    name: NonEmptyString
  }
`;

export const resolver: UserResolvers["name"] = (parent, _args, context) => {
  const authed = authAdminOrUserOwner(context, parent);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  return parent.name;
};
