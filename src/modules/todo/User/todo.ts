import type { UserResolvers } from "../../common/schema.ts";
import { authAdminOrUserOwner } from "../../user/common/authorizer.ts";
import { parseTodoNodeId } from "../common/parser.ts";
import { getTodo } from "../common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    todo(id: ID!): Todo
  }
`;

export const resolver: UserResolvers["todo"] = async (parent, args, context) => {
  authAdminOrUserOwner(context, parent);

  const id = parseTodoNodeId(args.id);

  return await getTodo(context, { id, userId: parent.id });
};
