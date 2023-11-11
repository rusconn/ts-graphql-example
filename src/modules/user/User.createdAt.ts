import type { UserResolvers } from "../common/schema";
import { isAdminOrUserOwner } from "./common/authorizer";
import { fullUser } from "./common/fuller";

export const typeDef = /* GraphQL */ `
  extend type User {
    createdAt: DateTime
  }
`;

export const resolver: UserResolvers["createdAt"] = async (parent, _args, context) => {
  authorizer(context.user, parent);

  const user = await fullUser(context.prisma, parent);

  return user.createdAt;
};

export const authorizer = isAdminOrUserOwner;
