import type { UserResolvers } from "../common/schema";
import { isUserOwner } from "./common/authorizer";
import { fullUser } from "./common/fuller";

export const typeDef = /* GraphQL */ `
  extend type User {
    token: NonEmptyString
  }
`;

export const resolver: UserResolvers["token"] = async (parent, _args, context) => {
  authorizer(context.user, parent);

  const user = await fullUser(context.prisma, parent);

  return user.token;
};

export const authorizer = isUserOwner;