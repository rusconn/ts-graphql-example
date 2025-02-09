import type { TodoResolvers } from "../../schema.ts";
import { userColumnsUnchecked } from "../User/_mapper.ts";
import { authAdminOrTodoOwner } from "../_authorizers/todo/adminOrTodoOwner.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    user: User
  }
`;

export const resolver: TodoResolvers["user"] = async (parent, _args, context, info) => {
  const authed = authAdminOrTodoOwner(context, parent);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const user = await context.api.user.load(parent.userId!, {
    columns: userColumnsUnchecked(info),
  });

  return user ?? null;
};
