import type { UserResolvers } from "../../../schema.ts";
import { badUserInputErr, forbiddenErr } from "../../common/resolvers.ts";
import { authAdminOrUserOwner } from "../../user/authorizer.ts";
import { parseTodoNodeId } from "../parser.ts";
import { getTodo } from "../resolver.ts";

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

  return todo ?? null;
};
