import type { TodoResolvers } from "../../../schema.ts";
import { forbiddenErr } from "../../common/resolvers.ts";
import { todoNodeId } from "../common/adapter.ts";
import { authAdminOrTodoOwner } from "../common/authorizer.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo implements Node {
    id: ID!
  }
`;

export const resolver: TodoResolvers["id"] = (parent, _args, context) => {
  const authed = authAdminOrTodoOwner(context, parent);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  return todoNodeId(parent.id);
};
