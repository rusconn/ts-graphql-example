import type { UserResolvers } from "../common/schema";
import { isAdminOrUserOwner } from "./common/authorizer";
import { fullUser } from "./common/fuller";

export const typeDef = /* GraphQL */ `
  extend type User {
    name: NonEmptyString
  }
`;

export const resolver: UserResolvers["name"] = async (parent, _args, context) => {
  authorizer(context.user, parent);

  const user = await fullUser(context.prisma, parent);

  return user.name;
};

export const authorizer = isAdminOrUserOwner;
