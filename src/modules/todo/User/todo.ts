import type { UserResolvers } from "../../../schema.ts";
import { badUserInputErr, forbiddenErr, notFoundErr } from "../../common/resolvers.ts";
import { authAdminOrUserOwner } from "../../user/common/authorizer.ts";
import { parseTodoNodeId } from "../common/parser.ts";
import { getTodo } from "../common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    todo(id: ID!): Todo
  }
`;

export const resolver: UserResolvers["todo"] = async (parent, args, context) => {
  const authed = authAdminOrUserOwner(context, parent);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parseTodoNodeId(args.id);

  if (parsed instanceof Error) {
    throw badUserInputErr(`invalid node id: ${args.id}`, parsed);
  }

  const todo = await getTodo(context, { id: parsed, userId: parent.id });

  if (!todo) {
    throw notFoundErr();
  }

  return todo;
};
