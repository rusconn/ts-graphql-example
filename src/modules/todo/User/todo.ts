import type { UserResolvers } from "../../../schema.ts";
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

  // existence check
  await getTodo(context, { id });

  return { id, userId: parent.id };
};
