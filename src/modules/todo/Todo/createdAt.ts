import * as uuidv7 from "../../../lib/uuidv7.ts";
import type { TodoResolvers } from "../../../schema.ts";
import { forbiddenErr } from "../../common/resolvers.ts";
import { authAdminOrTodoOwner } from "../authorizers.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    createdAt: DateTime
  }
`;

export const resolver: TodoResolvers["createdAt"] = (parent, _args, context) => {
  const authed = authAdminOrTodoOwner(context, parent);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  return uuidv7.date(parent.id);
};
