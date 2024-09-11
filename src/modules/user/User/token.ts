import type { UserResolvers } from "../../../schema.ts";
import { authUserOwner } from "../common/authorizer.ts";
import { getUser } from "../common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    token: NonEmptyString
  }
`;

export const resolver: UserResolvers["token"] = async (parent, _args, context) => {
  authUserOwner(context, parent);

  const user = await getUser(context, parent);

  return user.token;
};
