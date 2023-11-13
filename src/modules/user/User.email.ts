import type { UserResolvers } from "../common/schema.js";
import { isAdminOrUserOwner } from "./common/authorizer.js";
import { fullUser } from "./common/fuller.js";

export const typeDef = /* GraphQL */ `
  extend type User {
    email: EmailAddress
  }
`;

export const resolver: UserResolvers["email"] = async (parent, _args, context) => {
  authorizer(context.user, parent);

  const user = await fullUser(context.prisma, parent);

  return user.email;
};

export const authorizer = isAdminOrUserOwner;
