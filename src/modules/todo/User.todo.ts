import type { UserResolvers } from "../common/schema";
import { isAdminOrUserOwner } from "./common/authorizer";
import { parseTodoNodeId } from "./common/parser";

export const typeDef = /* GraphQL */ `
  extend type User {
    todo(id: ID!): Todo
  }
`;

export const resolver: UserResolvers["todo"] = (parent, args, context) => {
  authorizer(context.user, parent);

  const id = parser(args.id);

  return { id, userId: parent.id };
};

export const authorizer = isAdminOrUserOwner;

export const parser = parseTodoNodeId;
