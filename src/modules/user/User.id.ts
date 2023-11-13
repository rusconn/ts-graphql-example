import type { UserResolvers } from "../common/schema.js";
import { userNodeId } from "./common/adapter.js";
import { isAdminOrUserOwner } from "./common/authorizer.js";
import { fullUser } from "./common/fuller.js";

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
