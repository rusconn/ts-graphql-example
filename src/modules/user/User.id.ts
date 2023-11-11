import type { UserResolvers } from "../common/schema";
import { userNodeId } from "./common/adapter";
import { isAdminOrUserOwner } from "./common/authorizer";
import { fullUser } from "./common/fuller";

export const typeDef = /* GraphQL */ `
  extend type User {
    id: ID!
  }
`;

export const resolver: UserResolvers["id"] = async (parent, _args, context) => {
  authorizer(context.user, parent);

  const user = await fullUser(context.prisma, parent);

  return adapter(user.id);
};

export const authorizer = isAdminOrUserOwner;

export const adapter = userNodeId;
